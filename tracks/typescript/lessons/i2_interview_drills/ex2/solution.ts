// i2_interview_drills / ex2 - "write me a typed event emitter" (10 minutes).
// See lessons/i2_interview_drills/README.md, "Drill 2".
//
// The event map is the interesting part: `on` and `emit` must agree about the
// payload for each event name.

export interface EventMap {
  pass: { exercise: string };
  fail: { exercise: string; message: string };
}

export class Emitter {
  on(event: string, handler: (payload: unknown) => void): () => void {
    throw new Error("ex2: Emitter.on() is not implemented yet - edit this file.");
  }

  emit(event: string, payload: unknown): void {
    throw new Error("ex2: Emitter.emit() is not implemented yet - edit this file.");
  }
}
