// Assembles content-src/vol3/parts/<n>/ into a new explicitly named JSON file.
import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const partsDir = resolve(here, "parts");

const split = (text) => {
  const out = {};
  let key = null;
  const buf = [];
  for (const line of text.split("\n")) {
    const m = /^@@([A-Z]+)@@\s*$/.exec(line);
    if (m) {
      if (m[1] === key || Object.hasOwn(out, m[1]))
        throw new Error(`Duplicate @@${m[1]}@@ section`);
      if (!["PROMPT", "HINTS", "IMPORTANT", "REF"].includes(m[1]))
        throw new Error(`Unknown @@${m[1]}@@ section`);
      if (key) out[key] = buf.join("\n").trim();
      key = m[1];
      buf.length = 0;
    } else if (key) buf.push(line);
  }
  if (key) out[key] = buf.join("\n").trim();
  return out;
};

const lessons = [];
const dirs = (await readdir(partsDir, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const dir of dirs) {
  const base = resolve(partsDir, dir);
  const meta = JSON.parse(await readFile(resolve(base, "meta.json"), "utf8"));
  const read = (f) => readFile(resolve(base, f), "utf8");
  const lesson = {
    slug: meta.slug,
    title: meta.title,
    summary: (await read("summary.txt")).trim(),
    briefing: (await read("briefing.md")).trimEnd(),
    explanation: (await read("explanation.md")).trimEnd(),
    fullReadme: (await read("readme.md")).trimEnd(),
    fullReading: (await read("reading.md")).trimEnd(),
    exercises: [],
  };
  const specs = [
    ...["ex1", "ex2", "ex3", "ex4", "ex5", "ex6", "ex7", "ex8"].map(
      (id, i) => ({
        id,
        title: `Ex${i + 1}`,
        kind: "core",
        xp: 100,
        file: `${id}.md`,
        ref: `Ex${i + 1}.cs`,
      }),
    ),
    {
      id: "challenge",
      title: "Challenge",
      kind: "challenge",
      xp: 250,
      file: "challenge.md",
      ref: "Challenge.cs",
    },
    {
      id: "review1",
      title: "Review 1",
      kind: "review",
      xp: 140,
      file: "review1.md",
      ref: "Review1.cs",
    },
  ];
  for (const spec of specs) {
    const parts = split(await read(spec.file));
    for (const k of ["PROMPT", "HINTS", "IMPORTANT", "REF"]) {
      if (!parts[k]) throw new Error(`${dir}/${spec.file}: missing @@${k}@@`);
    }
    lesson.exercises.push({
      id: spec.id,
      title: spec.title,
      kind: spec.kind,
      prompt: parts.PROMPT,
      hints: parts.HINTS,
      importantHints: parts.IMPORTANT,
      references: { [spec.ref]: parts.REF },
      xp: spec.xp,
    });
  }
  lessons.push(lesson);
}

const candidate = process.argv[2];
if (!candidate || !/^[a-zA-Z0-9_-]{1,80}$/.test(candidate))
  throw new Error(
    "Supply a new candidate file name using letters, digits, underscores or hyphens. Existing authored files are never overwritten.",
  );
const outPath = resolve(here, `${candidate}.json`);
await writeFile(
  outPath,
  JSON.stringify({ track: "csharp", lessons }, null, 2),
  { encoding: "utf8", flag: "wx" },
);
const words = (s) => s.split(/\s+/).filter(Boolean).length;
console.log(`wrote ${outPath}`);
for (const l of lessons) {
  console.log(
    `${l.slug} missions=${l.exercises.length} summary=${l.summary.length}c ` +
      `briefing=${words(l.briefing)} explanation=${words(l.explanation)} ` +
      `readme=${words(l.fullReadme)} reading=${words(l.fullReading)}`,
  );
}
