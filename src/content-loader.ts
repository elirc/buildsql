import { byId, catalog, integer, object, text, TRACKS } from "./contracts";
import type {
  ContentIndex,
  Lesson,
  Mission,
  ResourceDoc,
  TrackPack,
} from "./types";

const cache = new Map<string, TrackPack>();
export async function boundedJson(
  url: string,
  limit: number,
): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok)
    throw Error(
      `Could not load ${url} (${response.status}). Retry when the local server is available.`,
    );
  const reader = response.body?.getReader();
  if (!reader) throw Error("Content response has no readable body.");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0,
    raw = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw Error(`Content exceeds its ${limit} byte limit.`);
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    return JSON.parse(raw);
  } catch (e) {
    await reader.cancel().catch(() => {});
    throw e;
  } finally {
    reader.releaseLock();
  }
}
export function validateIndex(value: unknown): ContentIndex {
  const index = object(value, [
    "version",
    "lessonCount",
    "exerciseCount",
    "tracks",
  ]);
  if (
    index.version !== 1 ||
    !Array.isArray(index.tracks) ||
    index.tracks.length !== TRACKS.length
  )
    throw Error("Invalid curriculum index.");
  const seen = new Set<string>();
  let lessons = 0,
    missions = 0;
  for (const value of index.tracks) {
    const m = object(value, [
      "id",
      "name",
      "description",
      "lessonCount",
      "exerciseCount",
      "coreCount",
      "pack",
    ]);
    if (
      !TRACKS.includes(m.id as (typeof TRACKS)[number]) ||
      seen.has(m.id as string) ||
      m.pack !== `/content/${m.id}.json`
    )
      throw Error("Unknown, duplicate or unsafe track path.");
    seen.add(m.id as string);
    text(m.name, "Track name", 200, 1);
    text(m.description, "Track description", 2000, 1);
    const known = catalog.filter((c) => c.track === m.id);
    if (
      m.lessonCount !== new Set(known.map((c) => c.lesson)).size ||
      m.exerciseCount !== known.length ||
      m.coreCount !== known.filter((c) => c.kind === "core").length
    )
      throw Error("Index and checked-in mission catalog disagree.");
    lessons += m.lessonCount as number;
    missions += m.exerciseCount as number;
  }
  if (index.lessonCount !== lessons || index.exerciseCount !== missions)
    throw Error("Incorrect total curriculum counts.");
  return value as ContentIndex;
}
export function validateTrack(value: unknown, id: string): TrackPack {
  const pack = object(value, ["id", "name", "description", "lessons"]);
  if (
    pack.id !== id ||
    !TRACKS.includes(id as (typeof TRACKS)[number]) ||
    !Array.isArray(pack.lessons)
  )
    throw Error("Invalid track pack.");
  text(pack.name, "Track name", 200, 1);
  text(pack.description, "Description", 2000, 1);
  const seen = new Set<string>(),
    seenLessons = new Set<string>(),
    known = catalog.filter((c) => c.track === id);
  if (pack.lessons.length !== new Set(known.map((c) => c.lesson)).size)
    throw Error("Track lesson count differs from catalog.");
  pack.lessons.forEach((value, i) => {
    const l = object(value, [
      "id",
      "slug",
      "order",
      "title",
      "summary",
      "briefing",
      "explanation",
      "fullReadme",
      "fullReading",
      "exercises",
    ]);
    if (
      typeof l.slug !== "string" ||
      !/^[a-zA-Z0-9_-]{1,160}$/.test(l.slug) ||
      l.id !== `${id}/${l.slug}` ||
      seenLessons.has(l.id as string) ||
      l.order !== i
    )
      throw Error("Invalid lesson identity or order.");
    seenLessons.add(l.id as string);
    for (const field of [
      "title",
      "summary",
      "briefing",
      "explanation",
      "fullReadme",
      "fullReading",
    ])
      text(l[field], field, 4 * 1024 * 1024, field === "summary" ? 0 : 1);
    if (
      !Array.isArray(l.exercises) ||
      l.exercises.length < 1 ||
      l.exercises.length > 100
    )
      throw Error("Invalid mission list.");
    for (const value of l.exercises) {
      const m = object(value, [
          "id",
          "title",
          "kind",
          "prompt",
          "hints",
          "importantHints",
          "references",
          "xp",
        ]),
        key = `${l.id}/${m.id}`,
        expected = byId.get(key);
      if (
        !expected ||
        seen.has(key) ||
        m.kind !== expected.kind ||
        m.xp !== expected.xp
      )
        throw Error("Mission identity, kind or reward differs from catalog.");
      seen.add(key);
      for (const f of ["title", "prompt", "hints", "importantHints"])
        text(m[f], f, 2 * 1024 * 1024, 1);
      const refs = object(m.references),
        names = Object.keys(refs);
      if (!names.length || names.length > 30)
        throw Error("Invalid reference list.");
      for (const [name, body] of Object.entries(refs)) {
        text(name, "Reference name", 300, 1);
        text(body, "Reference body", 2 * 1024 * 1024, 1);
      }
    }
  });
  if (seen.size !== known.length)
    throw Error("Track mission count differs from catalog.");
  return value as TrackPack;
}
export const loadIndex = async () =>
  validateIndex(await boundedJson("/content/index.json", 100000));
export async function loadTrack(id: string): Promise<TrackPack> {
  if (!TRACKS.includes(id as (typeof TRACKS)[number]))
    throw Error("Unknown track.");
  const cached = cache.get(id);
  if (cached) {
    cache.delete(id);
    cache.set(id, cached);
    return cached;
  }
  const pack = validateTrack(
    await boundedJson(`/content/${id}.json`, 32 * 1024 * 1024),
    id,
  );
  cache.set(id, pack);
  while (cache.size > 2) cache.delete(cache.keys().next().value!);
  return pack;
}
export async function loadResources(): Promise<ResourceDoc[]> {
  const data = object(
    await boundedJson("/content/resources.json", 16 * 1024 * 1024),
    ["resources"],
  );
  if (!Array.isArray(data.resources) || data.resources.length > 20)
    throw Error("Invalid manuals list.");
  const seen = new Set<string>();
  for (const value of data.resources) {
    const r = object(value, ["id", "title", "markdown"]);
    text(r.id, "Manual identity", 100, 1);
    text(r.title, "Manual title", 200, 1);
    text(r.markdown, "Manual text", 4 * 1024 * 1024, 1);
    if (seen.has(r.id as string)) throw Error("Duplicate manual.");
    seen.add(r.id as string);
  }
  return data.resources as ResourceDoc[];
}
