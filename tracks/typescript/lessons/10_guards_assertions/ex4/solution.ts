// 10_guards_assertions / ex4 - satisfies: check it, but do not widen it.
// See lessons/10_guards_assertions/README.md, "Exercise 4".
//
// The annotation below checks the object and then throws away what it knew
// about each individual member.

export type Setting = string | number | boolean;

export const settings: Record<string, Setting> = {
  label: "nightly",
  retries: 3,
  verbose: true,
};

export function describeSettings(): string {
  throw new Error("ex4: describeSettings() is not implemented yet - edit this file.");
}
