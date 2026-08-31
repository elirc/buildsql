// d17_backpressure / ex5 - reference solution (author only, used by `dojo verify`).
import type { Readable, Writable } from "node:stream";

export interface PumpReport {
  written: number;
  maxBuffered: number;
  pauses: number;
}

export function pumpWithHysteresis(
  source: Readable,
  sink: Writable,
  options: { pauseAbove: number; resumeBelow: number },
): Promise<PumpReport> {
  return new Promise<PumpReport>((resolve, reject) => {
    let written = 0;
    let maxBuffered = 0;
    let pauses = 0;
    let paused = false;

    const observe = (): void => {
      if (sink.writableLength > maxBuffered) maxBuffered = sink.writableLength;
    };

    const onData = (chunk: unknown): void => {
      written += 1;
      // The per-chunk write callback is the hook that "drain" cannot give you:
      // drain only fires when the buffer empties completely, and the resume
      // threshold is somewhere in the middle.
      sink.write(chunk, () => {
        observe();
        if (paused && sink.writableLength < options.resumeBelow) {
          paused = false;
          source.resume();
        }
      });

      observe();
      if (!paused && sink.writableLength > options.pauseAbove) {
        paused = true;
        pauses += 1;
        source.pause();
      }
    };

    const fail = (error: Error): void => {
      source.off("data", onData);
      reject(error);
    };

    source.on("data", onData);
    source.once("error", fail);
    sink.once("error", fail);
    source.once("end", () => {
      sink.end(() => resolve({ written, maxBuffered, pauses }));
    });
  });
}
