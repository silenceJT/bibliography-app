// Load a backup made by scripts/backup.mjs into a database.
//
//   1. Download the "biblio-backup-<date>" artifact from the Backup workflow
//      run on GitHub and unzip it (gives biblio-backup.tar.gz.enc).
//   2. Decrypt and unpack with the BACKUP_PASSPHRASE kept in your password
//      manager:
//        openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
//          -in biblio-backup.tar.gz.enc -pass env:BACKUP_PASSPHRASE | tar xz
//   3. Check what would happen (default, writes nothing):
//        MONGODB_URI=... node scripts/restore-backup.mjs backup
//      then load it:
//        MONGODB_URI=... node scripts/restore-backup.mjs backup --apply
//
// Refuses to touch a collection that already has documents unless
// --replace is given (which drops it first). --db <name> restores into
// another database, e.g. to inspect a backup next to the live data.
import { readFile, readdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";
import { MongoClient, BSON } from "mongodb";

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--db");
const apply = args.includes("--apply");
const replace = args.includes("--replace");
const dbArg = args.includes("--db") ? args[args.indexOf("--db") + 1] : null;
if (!dir) throw new Error("usage: node scripts/restore-backup.mjs <dir> [--apply] [--replace] [--db name]");
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");

const manifest = JSON.parse(await readFile(join(dir, "manifest.json"), "utf8"));
const files = (await readdir(dir)).filter((f) => f.endsWith(".jsonl"));

async function* docs(file) {
  const lines = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  for await (const line of lines) if (line.trim()) yield BSON.EJSON.parse(line, { relaxed: false });
}

const client = await new MongoClient(process.env.MONGODB_URI).connect();
try {
  const db = client.db(dbArg ?? manifest.database);
  console.log(`${apply ? "Restoring" : "Dry run:"} ${dir} (taken ${manifest.createdAt}) into database "${db.databaseName}"\n`);
  let problems = 0;
  for (const file of files.sort()) {
    const name = file.replace(/\.jsonl$/, "");
    const expected = manifest.collections[name]?.count;
    let n = 0;
    for await (const _ of docs(join(dir, file))) n++;
    const existing = await db.collection(name).estimatedDocumentCount();
    const blocked = existing > 0 && !replace;
    if (n !== expected) problems++;
    console.log(`${name.padEnd(32)} file ${String(n).padStart(7)} (manifest ${expected})  target has ${existing}${blocked ? "  → skipped: not empty (use --replace)" : ""}`);
    if (!apply || blocked) continue;
    if (existing > 0) await db.collection(name).drop();
    let batch = [];
    for await (const doc of docs(join(dir, file))) {
      batch.push(doc);
      if (batch.length === 1000) { await db.collection(name).insertMany(batch, { ordered: true }); batch = []; }
    }
    if (batch.length) await db.collection(name).insertMany(batch, { ordered: true });
    for (const idx of manifest.collections[name]?.indexes ?? []) {
      if (idx.name === "_id_") continue;
      const { key, name: idxName, v, ns, ...opts } = idx;
      await db.collection(name).createIndex(key, { name: idxName, ...opts });
    }
    const after = await db.collection(name).countDocuments();
    console.log(`${"".padEnd(32)} restored: ${after} docs${after === n ? "" : "  ← MISMATCH"}`);
    if (after !== n) problems++;
  }
  if (problems) { console.error(`\n${problems} problem(s) found`); process.exitCode = 1; }
} finally {
  await client.close();
}
