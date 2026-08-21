// i2_interview_drills / challenge - the 45-minute take-home: a typed store.
// See lessons/i2_interview_drills/README.md, "Challenge".

export interface Store<S> {
  getState(): S;
}

export function createStore<S>(initial: S): Store<S> {
  throw new Error("challenge: createStore() is not implemented yet - edit this file.");
}
