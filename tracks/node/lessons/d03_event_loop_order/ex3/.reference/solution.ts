// d03_event_loop_order / ex3 - reference solution (author only, used by `dojo verify`).
//
// Synchronously: outer() runs to its await, which first calls inner(), which
// runs to ITS await - so "outer-start", "inner-start". Then the .then chain is
// registered (nothing logged) and "sync-end" runs.
//
// Microtask 1: inner resumes -> "inner-end", and inner's promise fulfils.
// Microtask 2: the first .then handler -> "then-1".
//   (outer is awaiting a *promise*, and adopting one costs an extra hop, so
//   outer has not resumed yet. This is the whole point of the problem.)
// Microtask 3: outer resumes -> "outer-end".
// Microtask 4: the second .then handler -> "then-2".

export function predictOrder(): string[] {
  return [
    "outer-start",
    "inner-start",
    "sync-end",
    "inner-end",
    "then-1",
    "outer-end",
    "then-2",
  ];
}
