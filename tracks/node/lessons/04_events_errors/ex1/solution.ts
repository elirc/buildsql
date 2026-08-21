// 04_events_errors / ex1 - your first EventEmitter.
// See lessons/04_events_errors/README.md, "Exercise 1".
import { EventEmitter } from "node:events";

export class JobQueue extends EventEmitter {
  /** Adds a job, emits "added" with (job, newSize), returns the new size. */
  add(job: string): number {
    throw new Error("ex1: JobQueue.add() is not implemented yet - edit this file.");
  }

  /** Emits "drained" with the jobs, empties the queue, returns the jobs. */
  flush(): string[] {
    throw new Error("ex1: JobQueue.flush() is not implemented yet - edit this file.");
  }

  size(): number {
    throw new Error("ex1: JobQueue.size() is not implemented yet - edit this file.");
  }
}
