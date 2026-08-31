// d24_mixed_gauntlet / ex4 - reference solution (author only, used by `dojo verify`).
import type { EventEmitter } from "node:events";
import { Transform, type Duplex, type Readable, type Writable } from "node:stream";
import { pipeline } from "node:stream/promises";

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

export function runNamedPipeline(
  source: Readable,
  stages: readonly NamedStage[],
  sink: Writable,
  emitter: EventEmitter,
): Promise<number> {
  let done = 0;
  // The counter sits immediately before the sink, so "done" means "arrived",
  // not "was read".
  const counter = new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      done += 1;
      emitter.emit("progress", { done });
      callback(null, chunk);
    },
  });

  // A stream error carries no idea which stream produced it, so ask each one.
  let culprit: string | null = null;
  for (const stage of stages) {
    stage.stream.on("error", () => {
      if (culprit === null) culprit = stage.name;
    });
  }

  return pipeline([source, ...stages.map((stage) => stage.stream), counter, sink]).then(
    () => done,
    (error: unknown) => {
      const failure = new StageFailure(culprit ?? "pipeline", error);
      emitter.emit("failed", failure);
      throw failure;
    },
  );
}
