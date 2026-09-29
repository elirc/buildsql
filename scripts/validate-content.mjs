import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const candidate = process.argv[2];
if (candidate && !/^[a-zA-Z0-9_-]{1,80}$/.test(candidate))
  throw new Error(
    "Candidate name must use letters, digits, underscores or hyphens",
  );
const content = candidate
  ? resolve(root, "content-candidates", candidate)
  : resolve(root, "public", "content");
const index = JSON.parse(
  await readFile(resolve(content, "index.json"), "utf8"),
);
const failures = [];
const lessonIds = new Set();
const missionIds = new Set();
let lessonCount = 0;
let missionCount = 0;
let challengeCount = 0;
let bytes = 0;

const requireValue = (value, label) => {
  if (typeof value !== "string" || !value.trim())
    failures.push(`${label} is empty`);
};

if (index.tracks.length !== 6)
  failures.push(`expected 6 tracks, found ${index.tracks.length}`);

for (const meta of index.tracks) {
  if (
    !["sql", "typescript", "node", "react", "csharp", "dotnet"].includes(
      meta.id,
    )
  )
    throw new Error("Unknown track identifier");
  const path = resolve(content, `${meta.id}.json`);
  const pack = JSON.parse(await readFile(path, "utf8"));
  bytes += (await stat(path)).size;
  if (pack.id !== meta.id) failures.push(`${meta.id}: pack id mismatch`);
  if (pack.lessons.length !== meta.lessonCount)
    failures.push(`${meta.id}: lesson count mismatch`);
  let trackMissions = 0;
  let trackCores = 0;
  let expectedOrder = 0;
  for (const lesson of pack.lessons) {
    if (
      lesson.order !== expectedOrder++ ||
      lesson.id !== `${meta.id}/${lesson.slug}`
    )
      failures.push(`${lesson.id}: invalid order or identity`);
    lessonCount += 1;
    if (lessonIds.has(lesson.id))
      failures.push(`duplicate lesson ${lesson.id}`);
    lessonIds.add(lesson.id);
    requireValue(lesson.title, `${lesson.id}.title`);
    requireValue(lesson.briefing, `${lesson.id}.briefing`);
    requireValue(lesson.explanation, `${lesson.id}.explanation`);
    requireValue(lesson.fullReadme, `${lesson.id}.fullReadme`);
    requireValue(lesson.fullReading, `${lesson.id}.fullReading`);
    if (!lesson.exercises.some((mission) => mission.kind === "core")) {
      failures.push(`${lesson.id}: no core missions`);
    }
    for (const mission of lesson.exercises) {
      const id = `${lesson.id}/${mission.id}`;
      missionCount += 1;
      trackMissions += 1;
      if (missionIds.has(id)) failures.push(`duplicate mission ${id}`);
      missionIds.add(id);
      requireValue(mission.prompt, `${id}.prompt`);
      requireValue(mission.hints, `${id}.hints`);
      requireValue(mission.importantHints, `${id}.importantHints`);
      if (!Object.keys(mission.references ?? {}).length)
        failures.push(`${id}: no reference answer`);
      if (![100, 140, 250].includes(mission.xp))
        failures.push(`${id}: invalid XP ${mission.xp}`);
      if (mission.kind === "challenge") challengeCount += 1;
      if (mission.kind === "core") trackCores += 1;
      if (!["core", "challenge", "review"].includes(mission.kind))
        failures.push(`${id}: invalid kind`);
      for (const ref of Object.values(mission.references ?? {}))
        requireValue(ref, `${id}.reference`);
    }
  }
  if (trackMissions !== meta.exerciseCount)
    failures.push(`${meta.id}: mission count mismatch`);
  if (trackCores !== meta.coreCount)
    failures.push(`${meta.id}: core count mismatch`);
}

const resources = JSON.parse(
  await readFile(resolve(content, "resources.json"), "utf8"),
).resources;
if (resources.length !== 4)
  failures.push(`expected 4 field manuals, found ${resources.length}`);
for (const resource of resources)
  requireValue(resource.markdown, `manual ${resource.id}`);
if (lessonCount !== index.lessonCount)
  failures.push("global lesson count mismatch");
if (missionCount !== index.exerciseCount)
  failures.push("global mission count mismatch");

if (failures.length) {
  console.error(`Content validation failed with ${failures.length} error(s):`);
  for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Content verified: ${index.tracks.length} worlds, ${lessonCount} sectors, ${missionCount} missions, ${challengeCount} challenge gates, ${resources.length} field manuals (${(bytes / 1024 / 1024).toFixed(1)} MB).`,
);
