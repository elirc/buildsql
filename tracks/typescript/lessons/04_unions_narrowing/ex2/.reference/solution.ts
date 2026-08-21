// 04_unions_narrowing / ex2 - reference solution (author only).

export type DojoEvent =
  | { kind: "pass"; exercise: string; attempts: number }
  | { kind: "fail"; exercise: string; message: string }
  | { kind: "hint"; exercise: string; tier: number };

export function describeEvent(event: DojoEvent): string {
  switch (event.kind) {
    case "pass":
      return `${event.exercise} passed after ${event.attempts} attempts`;
    case "fail":
      return `${event.exercise} failed: ${event.message}`;
    case "hint":
      return `${event.exercise} revealed hint ${event.tier}`;
  }
}
