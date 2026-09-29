import catalogData from "./catalog.json";
import type { SaveState } from "./types";

export const TRACKS = [
  "sql",
  "typescript",
  "node",
  "react",
  "csharp",
  "dotnet",
] as const;
export const catalog = catalogData;
export const byId = new Map(catalog.map((item) => [item.id, item]));
export const MAX_BYTES = 8 * 1024 * 1024;
export const statuses = ["planned", "building", "review", "complete"] as const;
export interface PracticeProject {
  id: string;
  version: number;
  title: string;
  goal: string;
  evidence: string;
  status: (typeof statuses)[number];
  created: string;
  updated: string;
}
export interface Workspace {
  schema: 2;
  id: string;
  revision: number;
  save: SaveState;
  projects: PracticeProject[];
}
export function object(
  value: unknown,
  fields?: string[],
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    throw Error("Expected a plain object.");
  const obj = value as Record<string, unknown>;
  if (
    fields &&
    (Object.keys(obj).length !== fields.length ||
      fields.some((key) => !Object.hasOwn(obj, key)))
  )
    throw Error("Unexpected or missing fields.");
  return obj;
}
export function text(
  value: unknown,
  name: string,
  max: number,
  min = 0,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    value.trim().length < min ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
  )
    throw Error(`${name} must contain ${min} to ${max} valid characters.`);
  return value;
}
export function integer(value: unknown, min: number, max: number): number {
  if (
    !Number.isSafeInteger(value) ||
    (value as number) < min ||
    (value as number) > max
  )
    throw Error("Invalid bounded integer.");
  return value as number;
}
export function timestamp(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  )
    throw Error("Invalid UTC timestamp.");
  return value;
}
export function uuid(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
      value,
    )
  )
    throw Error("Invalid workspace or project identity.");
  return value;
}
export function assertSize(value: unknown) {
  if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_BYTES)
    throw Error(
      "Workspace exceeds 8 MiB. Export and review it; existing data was not replaced.",
    );
}
export function validateSave(value: unknown): SaveState {
  const s = object(value, [
    "version",
    "playerName",
    "completed",
    "earnedXp",
    "attempts",
    "work",
    "reviews",
    "streak",
    "lastActive",
    "selectedTrack",
  ]);
  if (
    s.version !== 1 ||
    !TRACKS.includes(s.selectedTrack as (typeof TRACKS)[number])
  )
    throw Error("Unsupported save version or track.");
  text(s.playerName, "Name", 24, 1);
  if (/[\r\n\t]/.test(s.playerName as string))
    throw Error("Name must fit on one line.");
  integer(s.streak, 0, 100000);
  if (s.lastActive !== null) {
    if (
      typeof s.lastActive !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(s.lastActive)
    )
      throw Error("Invalid activity day.");
    timestamp(s.lastActive + "T00:00:00.000Z");
  }
  if ((s.lastActive === null) !== (s.streak === 0))
    throw Error("Activity and streak disagree.");
  for (const field of [
    "completed",
    "earnedXp",
    "attempts",
    "work",
    "reviews",
  ]) {
    const map = object(s[field]);
    if (Object.keys(map).length > catalog.length)
      throw Error("Too many mission entries.");
    for (const [id, v] of Object.entries(map)) {
      const m = byId.get(id);
      if (!m) throw Error(`Unknown mission in ${field}: ${id}`);
      if (field === "completed") timestamp(v);
      if (field === "earnedXp" && v !== m.xp)
        throw Error("Reward differs from the curriculum.");
      if (field === "attempts") integer(v, 1, 100000);
      if (field === "work") text(v, "Mission notes", 100000);
      if (field === "reviews") {
        const r = object(v, ["stage", "due"]);
        integer(r.stage, 0, 9);
        timestamp(r.due);
      }
    }
  }
  const completed = object(s.completed),
    xp = object(s.earnedXp),
    reviews = object(s.reviews),
    attempts = object(s.attempts);
  const ids = Object.keys(completed);
  if (
    Object.keys(xp).length !== ids.length ||
    Object.keys(reviews).length !== ids.length ||
    ids.some(
      (id) =>
        !Object.hasOwn(xp, id) ||
        !Object.hasOwn(reviews, id) ||
        !Object.hasOwn(attempts, id),
    )
  )
    throw Error("Completion, reward, review and attempt histories disagree.");
  assertSize(s);
  return structuredClone(s) as unknown as SaveState;
}
export function validateProject(value: unknown): PracticeProject {
  const p = object(value, [
    "id",
    "version",
    "title",
    "goal",
    "evidence",
    "status",
    "created",
    "updated",
  ]);
  uuid(p.id);
  integer(p.version, 1, 100000);
  timestamp(p.created);
  timestamp(p.updated);
  text(p.title, "Project title", 80, 1);
  text(p.goal, "Observable goal", 2000, 20);
  text(p.evidence, "Evidence", 10000);
  if (/[\r\n\t]/.test(p.title as string))
    throw Error("Project title must fit on one line.");
  if (
    !statuses.includes(p.status as PracticeProject["status"]) ||
    (p.updated as string) < (p.created as string)
  )
    throw Error("Invalid project status or dates.");
  if (p.status === "review") text(p.evidence, "Review evidence", 10000, 40);
  if (p.status === "complete")
    text(p.evidence, "Completion evidence", 10000, 80);
  return structuredClone(p) as unknown as PracticeProject;
}
export function validateWorkspace(value: unknown): Workspace {
  const w = object(value, ["schema", "id", "revision", "save", "projects"]);
  if (w.schema !== 2) throw Error("Unsupported workspace schema.");
  uuid(w.id);
  integer(w.revision, 0, 1000000);
  const save = validateSave(w.save);
  if (!Array.isArray(w.projects) || w.projects.length > 100)
    throw Error("A workspace supports at most 100 practice projects.");
  const projects = w.projects.map(validateProject);
  if (
    new Set(projects.map((p) => p.id)).size !== projects.length ||
    new Set(projects.map((p) => p.title.trim().toLowerCase())).size !==
      projects.length
  )
    throw Error("Duplicate project identity or title.");
  const result = {
    schema: 2 as const,
    id: w.id as string,
    revision: w.revision as number,
    save,
    projects,
  };
  assertSize(result);
  return result;
}
export function parseImport(raw: string): SaveState | Workspace {
  if (new TextEncoder().encode(raw).length > MAX_BYTES)
    throw Error("Import exceeds 8 MiB.");
  const value: unknown = JSON.parse(raw);
  return object(value).schema === 2
    ? validateWorkspace(value)
    : validateSave(value);
}
