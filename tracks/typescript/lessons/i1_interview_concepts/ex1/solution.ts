// i1_interview_concepts / ex1 - any vs unknown.
// See lessons/i1_interview_concepts/README.md, "Exercise 1".
//
// `any` here means every caller can hand this function anything AND the body
// can do anything to it. Neither is what you want.

export function lengthOf(value: any): number {
  throw new Error("ex1: lengthOf() is not implemented yet - edit this file.");
}
