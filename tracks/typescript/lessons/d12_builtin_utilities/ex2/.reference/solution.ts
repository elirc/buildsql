// d12_builtin_utilities / ex2 - reference solution (author only).

export type Status = "draft" | "open" | "paused" | "closed" | "archived";

export type Live = Exclude<Status, "closed" | "archived">;

export type Dead = Extract<Status, "closed" | "archived">;

export function isLive(status: Status): status is Live {
  return status !== "closed" && status !== "archived";
}

export function liveOnly(statuses: readonly Status[]): Live[] {
  return statuses.filter(isLive);
}
