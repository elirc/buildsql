// 08_utility_types / review1 - Record, and a tally with no missing keys.
// See lessons/08_utility_types/README.md, "Review".

export type Verdict = "pass" | "fail" | "skip";

export type ScoreBoard = { [key: string]: number };

export function tallyVerdicts(verdicts: readonly Verdict[]): ScoreBoard {
  throw new Error("review1: tallyVerdicts() is not implemented yet - edit this file.");
}
