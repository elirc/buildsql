// 08_utility_types / review1 - reference solution (author only).

export type Verdict = "pass" | "fail" | "skip";

export type ScoreBoard = Record<Verdict, number>;

export function tallyVerdicts(verdicts: readonly Verdict[]): ScoreBoard {
  const board: ScoreBoard = { pass: 0, fail: 0, skip: 0 };
  for (const verdict of verdicts) {
    board[verdict] += 1;
  }
  return board;
}
