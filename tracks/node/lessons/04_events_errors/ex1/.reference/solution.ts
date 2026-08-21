// 04_events_errors / ex1 - reference solution (author only, used by `dojo verify`).
import { EventEmitter } from "node:events";

export class JobQueue extends EventEmitter {
  #jobs: string[] = [];

  add(job: string): number {
    this.#jobs.push(job);
    this.emit("added", job, this.#jobs.length);
    return this.#jobs.length;
  }

  flush(): string[] {
    const jobs = this.#jobs;
    this.#jobs = [];
    this.emit("drained", jobs);
    return jobs;
  }

  size(): number {
    return this.#jobs.length;
  }
}
