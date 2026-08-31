// d01_esm_cjs / ex6 - reference solution (author only, used by `dojo verify`).
//
// Entry's imports are hoisted and evaluated depth first, in source order:
//   ./beta -> its own first import ./alpha -> ./alpha imports ./trace (silent)
//   -> alpha's body runs           "alpha"
//   -> beta's second import ./trace is already evaluated, so nothing happens
//   -> beta's body runs            "beta sees alpha"
//   entry's ./alpha is already evaluated - a module body never runs twice
//   entry's ./trace is already evaluated
//   -> entry's own body runs       "entry"

export function predictEvaluationOrder(): string[] {
  return ["alpha", "beta sees alpha", "entry"];
}
