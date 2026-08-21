// 05_literals_enums / ex2 - as const, and what it freezes.
// See lessons/05_literals_enums/README.md, "Exercise 2".
//
// This object's property types are currently `string`. They should be the
// exact titles, and nobody should be able to reassign them.

export const TRACK_TITLES = {
  typescript: "TypeScript",
  node: "Node.js",
  react: "React",
};

export type TrackName = "typescript" | "node" | "react";

export function titleOf(track: TrackName): string {
  throw new Error("ex2: titleOf() is not implemented yet - edit this file.");
}
