// A pre-TypeScript helper module that ships as plain JavaScript. You do not
// edit this file - you describe it. See README.md, "Exercise 4".
export function slugify(title) {
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export const LEGACY_VERSION = "1.4.2";
