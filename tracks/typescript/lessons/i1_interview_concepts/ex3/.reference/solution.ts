// i1_interview_concepts / ex3 - reference solution (author only).

export interface DojoEvents {
  pass: { exercise: string };
}

// A second declaration of the same interface merges with the first.
export interface DojoEvents {
  fail: { exercise: string; message: string };
}

export function describeEvent<K extends keyof DojoEvents>(
  event: K,
  payload: DojoEvents[K],
): string {
  if (event === "fail") {
    const failure = payload as DojoEvents["fail"];
    return `fail ${failure.exercise}: ${failure.message}`;
  }
  const pass = payload as DojoEvents["pass"];
  return `pass ${pass.exercise}`;
}
