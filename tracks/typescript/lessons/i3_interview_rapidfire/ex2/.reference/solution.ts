// i3_interview_rapidfire / ex2 - reference solution (author only).

export type Level = "beginner" | "intermediate" | "advanced" | "master";

function assertNever(value: never): never {
  throw new Error(`unhandled level: ${JSON.stringify(value)}`);
}

export function levelBadge(level: Level): string {
  switch (level) {
    case "beginner":
      return "*";
    case "intermediate":
      return "**";
    case "advanced":
      return "***";
    case "master":
      return "****";
    default:
      return assertNever(level);
  }
}
