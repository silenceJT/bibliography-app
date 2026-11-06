// Run with: npm test  (node --test; Node 22 imports the .ts module directly)
import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeRegex, buildSearchQuery } from "./search-query.ts";

// What MongoDB's case-insensitive $regex does, for checking matches in JS
const matches = (cond, text) => new RegExp(cond.$regex, cond.$options).test(text);

test("special characters are matched literally", () => {
  for (const term of ["C++", "(1999)", "a.b", "[draft]", "x|y", "$5", "^start", "end$", "a\\b", "{1,2}", "?", "*"]) {
    const cond = { $regex: escapeRegex(term), $options: "i" };
    assert.ok(matches(cond, `before ${term} after`), `${term} should match itself`);
    assert.doesNotThrow(() => new RegExp(cond.$regex));
  }
  // "." no longer matches any character
  assert.equal(matches({ $regex: escapeRegex("a.c"), $options: "i" }, "abc"), false);
});

test("a backtracking pattern becomes plain text", () => {
  const cond = { $regex: escapeRegex("(a+)+$"), $options: "i" };
  const start = Date.now();
  assert.equal(matches(cond, "a".repeat(30) + "!"), false);
  assert.ok(Date.now() - start < 50);
});

test("free-text query searches title, author, publication and keywords", () => {
  const q = buildSearchQuery("  Papua (west) ");
  assert.deepEqual(
    q.$or.map((c) => Object.keys(c)[0]),
    ["title", "author", "publication", "keywords"]
  );
  assert.ok(matches(q.$or[0].title, "Languages of Papua (West)"));
});

test("empty query and empty filters give an empty filter", () => {
  assert.deepEqual(buildSearchQuery("   ", { keywords: "  ", source: undefined }), {});
});

test("year: exact, range, invalid", () => {
  assert.deepEqual(buildSearchQuery("", { year: "1999" }), { year: { $in: [1999, "1999"] } });
  assert.deepEqual(buildSearchQuery("", { year: "1990 - 1999" }), { year: { $gte: 1990, $lte: 1999 } });
  assert.deepEqual(buildSearchQuery("", { year: "1999-1990" }), {});
  assert.deepEqual(buildSearchQuery("", { year: "abc" }), {});
});

test("other filters are escaped substring matches", () => {
  const q = buildSearchQuery("", { language_family: "Trans-New Guinea (TNG)" });
  assert.ok(matches(q.language_family, "trans-new guinea (tng)"));
  assert.equal(matches(q.language_family, "Trans-New Guinea TNG"), false);
});
