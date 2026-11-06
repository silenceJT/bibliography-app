/**
 * MongoDB filter for a bibliography search. Shared by the list/search API and
 * the CSV export so both match the same records.
 *
 * User input is matched as literal text: it is escaped before going into
 * `$regex`, so "C++" or "(1999)" search for those characters instead of
 * failing as invalid patterns, and a crafted pattern can't make the database
 * do catastrophic backtracking over every record.
 */

/** Escape every character that has a meaning in a regular expression. */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const contains = (text: string) => ({
  $regex: escapeRegex(text),
  $options: "i",
});

/** Fields the free-text query searches. */
const TEXT_FIELDS = ["title", "author", "publication", "keywords"];

export function buildSearchQuery(
  query: string,
  filters: Record<string, string | undefined> = {}
): Record<string, unknown> {
  const searchQuery: Record<string, unknown> = {};

  const q = query.trim();
  if (q) {
    searchQuery.$or = TEXT_FIELDS.map((field) => ({ [field]: contains(q) }));
  }

  for (const [key, raw] of Object.entries(filters)) {
    const value = raw?.trim();
    if (!value) continue;

    if (key === "year") {
      // "1999" or a range "1990-1999"; anything else is ignored
      if (value.includes("-")) {
        const [start, end] = value.split("-").map((y) => parseInt(y.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          searchQuery.year = { $gte: start, $lte: end };
        }
      } else {
        // Most years are stored as numbers, a few as strings
        const year = parseInt(value);
        if (!isNaN(year)) searchQuery.year = { $in: [year, String(year)] };
      }
    } else {
      searchQuery[key] = contains(value);
    }
  }

  return searchQuery;
}
