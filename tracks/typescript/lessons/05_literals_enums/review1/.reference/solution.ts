// 05_literals_enums / review1 - reference solution (author only).

export type Verdict = "pass" | "fail" | "skip";

export function verdictIcon(verdict: Verdict): string {
  switch (verdict) {
    case "pass":
      return "ok";
    case "fail":
      return "x";
    case "skip":
      return "-";
  }
}
