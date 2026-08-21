// 05_literals_enums / ex1 - reference solution (author only).

export type Level = "beginner" | "intermediate" | "advanced";

export function nextLevel(level: Level): Level {
  switch (level) {
    case "beginner":
      return "intermediate";
    case "intermediate":
      return "advanced";
    case "advanced":
      return "advanced";
  }
}
