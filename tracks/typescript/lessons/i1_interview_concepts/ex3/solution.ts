// i1_interview_concepts / ex3 - declaration merging, and what interfaces can do
// that type aliases cannot.
// See lessons/i1_interview_concepts/README.md, "Exercise 3".
//
// A second module wants to add its own event to this map without editing the
// original declaration. Only one of `interface` and `type` allows that.

export interface DojoEvents {
  pass: { exercise: string };
}

export function describeEvent<K extends keyof DojoEvents>(
  event: K,
  payload: DojoEvents[K],
): string {
  throw new Error("ex3: describeEvent() is not implemented yet - edit this file.");
}
