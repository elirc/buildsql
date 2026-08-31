// d12_builtin_utilities / ex2 - Exclude and Extract.
// See lessons/d12_builtin_utilities/README.md, "ex2".
//
// Both halves are currently the whole union, and isLive() narrows nothing.

export type Status = "draft" | "open" | "paused" | "closed" | "archived";

export type Live = Status;

export type Dead = Status;

export function isLive(status: Status): boolean {
  throw new Error("ex2: isLive() is not implemented yet - edit this file.");
}

export function liveOnly(statuses: readonly Status[]): Live[] {
  throw new Error("ex2: liveOnly() is not implemented yet - edit this file.");
}
