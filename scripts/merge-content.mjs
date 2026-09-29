// Prepares a new unpublished candidate from authored expansion volumes.
// Published packs are inputs; review and promotion are separate operations.
import {
  readdir,
  readFile,
  writeFile,
  mkdir,
  copyFile,
  lstat,
} from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const contentDir = resolve(root, "public", "content");
const volume = process.argv[2];
const candidate = process.argv[3];
if (
  !volume ||
  !candidate ||
  !/^[a-zA-Z0-9_-]{1,80}$/.test(volume) ||
  !/^[a-zA-Z0-9_-]{1,80}$/.test(candidate)
) {
  console.error(
    "usage: node scripts/merge-content.mjs <volume-name> <new-candidate-name>; names use letters, digits, underscores or hyphens",
  );
  process.exit(1);
}
const srcDir = resolve(root, "content-src", volume);
const files = (await readdir(srcDir))
  .filter((name) => name.endsWith(".json"))
  .sort();
if (!files.length) {
  console.error(`no authored files in ${srcDir}`);
  process.exit(1);
}

const index = JSON.parse(
  await readFile(resolve(contentDir, "index.json"), "utf8"),
);
if (
  !Array.isArray(index.tracks) ||
  index.tracks.length !== 6 ||
  new Set(index.tracks.map((m) => m.id)).size !== 6 ||
  index.tracks.some(
    (m) =>
      !["sql", "typescript", "node", "react", "csharp", "dotnet"].includes(
        m.id,
      ),
  )
)
  throw new Error("Invalid published track index");
const packs = new Map();
for (const meta of index.tracks) {
  packs.set(
    meta.id,
    JSON.parse(await readFile(resolve(contentDir, `${meta.id}.json`), "utf8")),
  );
}

const problems = [];
let added = 0;
let addedMissions = 0;

const text = (value) => typeof value === "string" && value.trim().length > 0;

function incompleteReason(lesson) {
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(lesson.slug ?? "")) return "invalid slug";
  for (const field of [
    "title",
    "summary",
    "briefing",
    "explanation",
    "fullReadme",
    "fullReading",
  ]) {
    if (!text(lesson[field])) return `missing ${field}`;
  }
  const missions = lesson.exercises ?? [];
  if (
    !Array.isArray(missions) ||
    missions.length > 100 ||
    new Set(missions.map((m) => m.id)).size !== missions.length
  )
    return "invalid or duplicate missions";
  if (!missions.some((mission) => mission.kind === "core"))
    return "no core missions";
  for (const mission of missions) {
    if (
      !/^[a-zA-Z0-9_-]{1,80}$/.test(mission.id ?? "") ||
      !text(mission.title) ||
      !["core", "challenge", "review"].includes(mission.kind)
    )
      return "invalid mission identity, title or kind";
    if (
      !text(mission.id) ||
      !text(mission.prompt) ||
      !text(mission.hints) ||
      !text(mission.importantHints)
    ) {
      return `mission ${mission.id ?? "?"} missing text`;
    }
    if (![100, 140, 250].includes(mission.xp))
      return `mission ${mission.id} bad xp`;
    const references = Object.values(mission.references ?? {});
    if (!references.length || !references.every(text))
      return `mission ${mission.id} missing reference`;
  }
  return null;
}

for (const file of files) {
  const data = JSON.parse(await readFile(resolve(srcDir, file), "utf8"));
  const pack = packs.get(data.track);
  if (!pack) {
    problems.push(`${file}: unknown track ${data.track}`);
    continue;
  }
  const seen = new Set(pack.lessons.map((lesson) => lesson.slug));
  for (const lesson of data.lessons) {
    if (!lesson.slug || seen.has(lesson.slug)) {
      problems.push(`${file}: duplicate or missing slug ${lesson.slug}`);
      continue;
    }
    const incomplete = incompleteReason(lesson);
    if (incomplete) {
      problems.push(
        `${file}:${lesson.slug} - ${incomplete}; no incomplete lesson is silently skipped`,
      );
      continue;
    }
    seen.add(lesson.slug);
    const order = pack.lessons.length;
    pack.lessons.push({
      id: `${data.track}/${lesson.slug}`,
      slug: lesson.slug,
      order,
      title: lesson.title,
      summary: lesson.summary,
      briefing: lesson.briefing,
      explanation: lesson.explanation,
      fullReadme: lesson.fullReadme,
      fullReading: lesson.fullReading,
      exercises: lesson.exercises,
    });
    added += 1;
    addedMissions += lesson.exercises.length;
  }
}

if (problems.length) {
  console.error(`merge aborted with ${problems.length} problem(s):`);
  for (const problem of problems.slice(0, 30)) console.error(`- ${problem}`);
  process.exit(1);
}

let lessonTotal = 0;
let missionTotal = 0;
const candidateRoot = resolve(root, "content-candidates");
await mkdir(candidateRoot, { recursive: true });
if ((await lstat(candidateRoot)).isSymbolicLink())
  throw new Error("Candidate root must be a normal project directory");
const outputDir = resolve(candidateRoot, candidate);
await mkdir(outputDir); // Refuse existing candidate directories; never overwrite published packs.
const catalog = [];
for (const meta of index.tracks) {
  const pack = packs.get(meta.id);
  meta.lessonCount = pack.lessons.length;
  meta.exerciseCount = pack.lessons.reduce(
    (sum, lesson) => sum + lesson.exercises.length,
    0,
  );
  meta.coreCount = pack.lessons.reduce(
    (sum, lesson) =>
      sum +
      lesson.exercises.filter((mission) => mission.kind === "core").length,
    0,
  );
  lessonTotal += meta.lessonCount;
  missionTotal += meta.exerciseCount;
  for (const lesson of pack.lessons)
    for (const mission of lesson.exercises)
      catalog.push({
        id: `${lesson.id}/${mission.id}`,
        track: pack.id,
        lesson: lesson.id,
        kind: mission.kind,
        xp: mission.xp,
      });
  await writeFile(resolve(outputDir, `${meta.id}.json`), JSON.stringify(pack), {
    flag: "wx",
  });
}
index.lessonCount = lessonTotal;
index.exerciseCount = missionTotal;
await writeFile(
  resolve(outputDir, "index.json"),
  `${JSON.stringify(index, null, 2)}\n`,
  { flag: "wx" },
);
await copyFile(
  resolve(contentDir, "resources.json"),
  resolve(outputDir, "resources.json"),
);
await writeFile(resolve(outputDir, "catalog.json"), JSON.stringify(catalog), {
  flag: "wx",
});
await writeFile(
  resolve(outputDir, "CANDIDATE.md"),
  "# Unpublished curriculum candidate\n\nReview every changed lesson and run the validator against this candidate. No published file has been replaced. A candidate is not a release; promote packs, index and src/catalog.json together in a reviewed checkout and run the application checks. A failed candidate generation may leave this directory incomplete.\n",
  { flag: "wx" },
);

console.log(
  `Prepared ${outputDir}: +${added} sectors, +${addedMissions} missions -> ${lessonTotal} sectors, ${missionTotal} missions. Published content unchanged.`,
);
