// d24_mixed_gauntlet / ex4 - streams + events + an error that knows where it came from.
// See lessons/d24_mixed_gauntlet/README.md, "Problem 4".
import type { EventEmitter } from "node:events";
import type { Duplex, Readable, Writable } from "node:stream";

/** A stream error, wrapped with the name of the stage that produced it. */
export class StageFailure extends Error {
  readonly stage: string;

  constructor(stage: string, cause: unknown) {
    super(`stage ${stage} failed`, { cause });
    this.name = "StageFailure";
    this.stage = stage;
  }
}

export interface NamedStage {
  name: string;
  stream: Duplex;
}

/**
 * Run `source` through `stages` into `sink`. Emits `progress` with `{ done }`
 * for every item that reaches the sink and resolves with the total. A failing
 * stage rejects with a `StageFailure` naming it, and emits `failed` with it.
 */
export function runNamedPipeline(
  source: Readable,
  stages: readonly NamedStage[],
  sink: Writable,
  emitter: EventEmitter,
): Promise<number> {
  throw new Error("ex4: runNamedPipeline() is not implemented yet - edit this file.");
}
