// i3_interview_rapidfire / ex2 - 90 seconds: close the union.
// See lessons/i3_interview_rapidfire/README.md, "Round 2".

export type Level = "beginner" | "intermediate" | "advanced" | "master";

export function levelBadge(level: Level): string {
  switch (level) {
    case "beginner":
      return "*";
    case "intermediate":
      return "**";
    default:
      return "?";
  }
}
