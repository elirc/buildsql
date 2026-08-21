// i1_interview_concepts / ex4 - the require cache.
// See lessons/i1_interview_concepts/README.md, "Exercise 4".

export interface CounterModule {
  loads: number;
}

/** require() the shipped counter.cjs the ordinary way. */
export function loadCached(): CounterModule {
  throw new Error("ex4: loadCached() is not implemented yet - edit this file.");
}

/** Force counter.cjs to be evaluated again, and return the new instance. */
export function loadFresh(): CounterModule {
  throw new Error("ex4: loadFresh() is not implemented yet - edit this file.");
}
