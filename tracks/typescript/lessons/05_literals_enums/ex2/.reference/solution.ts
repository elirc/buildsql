// 05_literals_enums / ex2 - reference solution (author only).

export const TRACK_TITLES = {
  typescript: "TypeScript",
  node: "Node.js",
  react: "React",
} as const;

export type TrackName = "typescript" | "node" | "react";

export function titleOf(track: TrackName): string {
  return TRACK_TITLES[track];
}
