import type { Lesson, Mission, SaveState } from "./types";
import {
  byId,
  catalog,
  text,
  validateSave,
  validateWorkspace,
  type Workspace,
  type PracticeProject,
} from "./contracts";

export const SAVE_KEY = "ipskill.save.v1";
export const REVIEW_INTERVALS = [3, 7, 21, 60, 120, 240, 365, 540, 730, 1095];
const DAY = 86400000;
export const initialSave: SaveState = {
  version: 1,
  playerName: "Rookie",
  completed: {},
  earnedXp: {},
  attempts: {},
  work: {},
  reviews: {},
  streak: 0,
  lastActive: null,
  selectedTrack: "sql",
};
export const freshSave = (): SaveState => structuredClone(initialSave);
export const missionKey = (lesson: Lesson, mission: Mission) =>
  `${lesson.id}/${mission.id}`;
export const xpFor = (save: SaveState) =>
  Object.values(save.earnedXp).reduce((sum, n) => sum + n, 0);
export const levelFor = (xp: number) => Math.floor(Math.sqrt(xp / 350)) + 1;
export function progressToNextLevel(xp: number) {
  const level = levelFor(xp),
    start = (level - 1) ** 2 * 350,
    end = level ** 2 * 350;
  return {
    level,
    current: xp - start,
    needed: end - start,
    percent: (100 * (xp - start)) / (end - start),
  };
}
export function lessonUnlocked(
  lessons: Lesson[],
  index: number,
  save: SaveState,
) {
  if (index < 0 || index >= lessons.length) return false;
  return lessons
    .slice(0, index)
    .every((lesson) =>
      lesson.exercises
        .filter((m) => m.kind === "core")
        .every((m) => Boolean(save.completed[missionKey(lesson, m)])),
    );
}
export function missionUnlocked(
  lesson: Lesson,
  mission: Mission,
  save: SaveState,
) {
  if (!lesson.exercises.some((m) => m.id === mission.id)) return false;
  const cores = lesson.exercises.filter((m) => m.kind === "core");
  const prior =
    mission.kind === "core"
      ? cores.slice(
          0,
          cores.findIndex((m) => m.id === mission.id),
        )
      : cores;
  return prior.every((m) => Boolean(save.completed[missionKey(lesson, m)]));
}
export function canComplete(save: SaveState, id: string) {
  const mission = byId.get(id);
  if (!mission) return false;
  if (save.completed[id]) return true;
  const track = catalog.filter((m) => m.track === mission.track);
  const first = track.findIndex((m) => m.lesson === mission.lesson);
  const before = track.slice(0, first).filter((m) => m.kind === "core");
  const own = track.filter(
    (m) => m.lesson === mission.lesson && m.kind === "core",
  );
  const required =
    mission.kind === "core"
      ? own.slice(
          0,
          own.findIndex((m) => m.id === id),
        )
      : own;
  return [...before, ...required].every((m) => Boolean(save.completed[m.id]));
}
export function completeMission(
  save: SaveState,
  id: string,
  now = new Date(),
  outcome: "pass" | "retry" = "pass",
): SaveState {
  const current = validateSave(save),
    mission = byId.get(id);
  if (!mission || !canComplete(current, id))
    throw Error("Complete the prerequisite core missions first.");
  if (!Number.isFinite(now.getTime())) throw Error("Invalid review time.");
  text(current.work[id], "Written evidence", 100000, 20);
  if (current.lastActive && now.toISOString().slice(0, 10) < current.lastActive)
    throw Error(
      "Clock is earlier than the last activity day. Review the device clock.",
    );
  const next = structuredClone(current),
    day = now.toISOString().slice(0, 10);
  next.attempts[id] = (next.attempts[id] ?? 0) + 1;
  if (outcome === "pass" && !next.completed[id]) {
    next.completed[id] = now.toISOString();
    next.earnedXp[id] = mission.xp;
    next.reviews[id] = {
      stage: 0,
      due: new Date(now.getTime() + 3 * DAY).toISOString(),
    };
  } else if (next.completed[id] && outcome === "retry") {
    next.reviews[id] = {
      stage: 0,
      due: new Date(now.getTime() + DAY).toISOString(),
    };
  } else if (
    next.reviews[id] &&
    Date.parse(next.reviews[id].due) <= now.getTime()
  ) {
    const stage = Math.min(
      next.reviews[id].stage + 1,
      REVIEW_INTERVALS.length - 1,
    );
    next.reviews[id] = {
      stage,
      due: new Date(
        now.getTime() + REVIEW_INTERVALS[stage] * DAY,
      ).toISOString(),
    };
  }
  if (current.lastActive !== day) {
    next.streak =
      current.lastActive ===
      new Date(now.getTime() - DAY).toISOString().slice(0, 10)
        ? current.streak + 1
        : 1;
    next.lastActive = day;
  }
  return validateSave(next);
}
export function dueReviewIds(save: SaveState, now = new Date()) {
  return Object.entries(save.reviews)
    .filter(([, r]) => Date.parse(r.due) <= now.getTime())
    .sort(
      (a, b) => a[1].due.localeCompare(b[1].due) || a[0].localeCompare(b[0]),
    )
    .map(([id]) => id);
}
export function putProject(
  workspace: Workspace,
  input: Omit<PracticeProject, "created" | "updated" | "version">,
  expectedVersion?: number,
  now = new Date(),
): Workspace {
  const current = validateWorkspace(workspace),
    existing = current.projects.find((p) => p.id === input.id);
  if (
    existing
      ? existing.version !== expectedVersion
      : expectedVersion !== undefined
  )
    throw Error(
      "Practice project changed. Reopen its current version before saving.",
    );
  const project = {
    ...input,
    title: input.title.trim(),
    goal: input.goal.trim(),
    version: existing ? existing.version + 1 : 1,
    created: existing?.created ?? now.toISOString(),
    updated: now.toISOString(),
  };
  const projects = existing
    ? current.projects.map((p) => (p.id === input.id ? project : p))
    : [...current.projects, project];
  return validateWorkspace({ ...current, projects });
}
export function deleteProject(
  workspace: Workspace,
  id: string,
  expectedVersion: number,
): Workspace {
  const current = validateWorkspace(workspace),
    project = current.projects.find((p) => p.id === id);
  if (!project || project.version !== expectedVersion)
    throw Error(
      "Practice project changed. Review its current version before deletion.",
    );
  return { ...current, projects: current.projects.filter((p) => p.id !== id) };
}
