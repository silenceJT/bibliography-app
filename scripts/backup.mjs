// Export every collection of the Biblio database to <outDir>/<collection>.jsonl
// (one Extended JSON document per line, so ObjectIds and dates survive) plus
// manifest.json with document counts and index definitions. Read-only.
//
//   MONGODB_URI=... node scripts/backup.mjs backup-dir
//
// .github/workflows/backup.yml runs this weekly, then archives and encrypts
// the directory; scripts/restore-backup.mjs loads it back.
import { mkdir, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { MongoClient, BSON } from "mongodb";

const DB_NAME = "test";
const outDir = process.argv[2];
if (!outDir) throw new Error("usage: node scripts/backup.mjs <outDir>");
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");

await mkdir(outDir, { recursive: true });
const client = await new MongoClient(process.env.MONGODB_URI).connect();
try {
  const db = client.db(DB_NAME);
  const manifest = {
    database: DB_NAME,
    createdAt: new Date().toISOString(),
    collections: {},
  };
  const names = (await db.listCollections({ type: "collection" }).toArray())
    .map((c) => c.name)
    .sort();
  for (const name of names) {
    const file = join(outDir, `${name}.jsonl`);
    await writeFile(file, "");
    let count = 0;
    let batch = [];
    for await (const doc of db.collection(name).find({}, { sort: { _id: 1 } })) {
      batch.push(BSON.EJSON.stringify(doc, { relaxed: false }));
      count++;
      if (batch.length === 1000) {
        await appendFile(file, batch.join("\n") + "\n");
        batch = [];
      }
    }
    if (batch.length) await appendFile(file, batch.join("\n") + "\n");
    const indexes = await db.collection(name).indexes();
    manifest.collections[name] = { count, indexes };
    console.log(`${name.padEnd(32)} ${String(count).padStart(7)} docs`);
  }
  await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
} finally {
  await client.close();
}
