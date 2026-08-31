// Gate for node/d17_backpressure. Quoted verbatim in README.md.
//
// Backpressure is graded by MEMORY, never by time. Every sink here holds its
// write callbacks until the gate releases them by hand, and every claim is
// about writableLength, readableLength, or a count of units of work that were
// started. Nothing sleeps, and nothing depends on how fast your machine is.
import { Readable, Writable } from "node:stream";
import { getEventListeners } from "node:events";
import { pipeline } from "node:stream/promises";
import { describe, expect, test } from "vitest";

import { writeAndWait } from "./ex1/solution";
import { createDemandSource } from "./ex2/solution";
import { createLossySink } from "./ex3/solution";
import { createAsyncStage } from "./ex4/solution";
import { pumpWithHysteresis } from "./ex5/solution";
import { writeAllOrAbort } from "./ex6/solution";
import { createBatchingWriter } from "./ex7/solution";
import { balanceAcross } from "./ex8/solution";

/** Hand the loop back a fixed number of times. A count of turns, not a delay. */
async function settle(): Promise<void> {
  for (let turn = 0; turn < 8; turn += 1) {
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

/**
 * A sink that accepts a chunk and then stops, holding its write callback until
 * the gate hands it back. This is what makes "how much was buffered" an exact
 * number instead of a race.
 */
function heldSink(options: { highWaterMark?: number; objectMode?: boolean } = {}) {
  const received: unknown[] = [];
  const held: (() => void)[] = [];
  const stream = new Writable({
    objectMode: true,
    ...options,
    write(chunk, _encoding, callback) {
      received.push(chunk);
      held.push(() => callback());
    },
  });
  return {
    stream,
    received,
    heldCount: () => held.length,
    releaseOne: () => held.shift()?.(),
    releaseAll: () => {
      while (held.length > 0) held.shift()?.();
    },
  };
}

/** A source that reports how many items it has actually produced. */
function countingSource(items: readonly unknown[], highWaterMark: number) {
  let index = 0;
  const stream = new Readable({
    objectMode: true,
    highWaterMark,
    read() {
      if (index >= items.length) {
        this.push(null);
        return;
      }
      this.push(items[index]);
      index += 1;
    },
  });
  return { stream, produced: () => index };
}

describe("d17_backpressure", () => {
  test("ex1 - writeAndWait() resolves on true and waits for drain on false", async () => {
    const roomy = heldSink({ highWaterMark: 4 });
    await writeAndWait(roomy.stream, "a");
    expect(
      roomy.received,
      "the chunk was handed over. Note what did NOT have to happen first: the " +
        "sink is still holding its callback, so nothing has been flushed - " +
        "write() returning true means you may write more, not that it is written",
    ).toEqual(["a"]);
    expect(
      roomy.stream.listenerCount("drain"),
      "and because write() said yes there was no reason to listen for a drain " +
        "at all. A listener added on the fast path is a listener leaked on " +
        "every chunk of a big upload",
    ).toBe(0);

    const tight = heldSink({ highWaterMark: 1 });
    let settledEarly = false;
    const waiting = writeAndWait(tight.stream, "b").then(() => {
      settledEarly = true;
    });
    await settle();
    expect(
      settledEarly,
      "at a highWaterMark of 1 this chunk filled the buffer, so write() " +
        "returned false and you have to wait. Resolving here is the bug the " +
        "whole lesson is about: it is how a 2GB file becomes a 2GB heap",
    ).toBe(false);
    expect(tight.stream.writableLength, "one chunk is sitting in the sink").toBe(1);

    tight.releaseOne();
    await waiting;
    expect(
      tight.stream.listenerCount("drain"),
      "the drain listener is removed once it has fired",
    ).toBe(0);
    expect(
      tight.stream.listenerCount("error"),
      "and so is the error listener you added alongside it",
    ).toBe(0);

    const doomed = heldSink({ highWaterMark: 1 });
    const rejected = writeAndWait(doomed.stream, "c");
    await settle();
    doomed.stream.destroy(new Error("the sink exploded"));
    await expect(
      rejected,
      "a stream that dies while you are waiting for its drain will never send " +
        "one. Without an error listener this promise is never settled, and the " +
        "upload hangs for ever with no error anywhere",
    ).rejects.toThrow("the sink exploded");
    expect(
      doomed.stream.listenerCount("drain"),
      "and the drain listener goes too - once() removes the one that fired, " +
        "not the other one",
    ).toBe(0);
  });

  test("ex2 - createDemandSource() produces only what has been asked for", async () => {
    const source = createDemandSource(["a", "b", "c", "d", "e", "f"], 2);
    expect(
      source.produced(),
      "nothing at all until somebody reads. A source that fills its buffer in " +
        "the constructor has already lost - the whole point of a stream is that " +
        "the data does not exist yet",
    ).toBe(0);

    const seen: unknown[] = [];
    for await (const item of source) {
      seen.push(item);
      expect(
        source.produced() - seen.length,
        "the source is never more than a highWaterMark ahead of its consumer. " +
          "If this number climbs, _read() is pushing everything it has instead " +
          "of one item per call, and the buffer is the whole input",
      ).toBeLessThanOrEqual(2);
    }

    expect(seen, "everything arrives, in order").toEqual(["a", "b", "c", "d", "e", "f"]);
    expect(source.produced(), "and everything was produced exactly once").toBe(6);

    const nothing = createDemandSource([], 2);
    const empty: unknown[] = [];
    for await (const item of nothing) empty.push(item);
    expect(
      empty,
      "an empty source ends cleanly rather than hanging - if this test times " +
        "out you never signalled the end",
    ).toEqual([]);
  });

  test("ex3 - createLossySink() drops rather than blocks", async () => {
    const sink = createLossySink({ capacity: 3 });
    const answers = ["a", "b", "c", "d", "e"].map((item) => sink.write(item));

    expect(
      answers.every((answer) => answer === true),
      "every write() said yes. This sink never asks its writer to slow down - " +
        "that is the trade it makes, and it is the right one for metrics and " +
        "logs where a slow consumer must never stall the request path",
    ).toBe(true);

    await settle();
    expect(
      sink.writableLength,
      "and nothing is queued inside it either. A lossy sink that buffers is " +
        "just a leaky sink with extra steps",
    ).toBe(0);
    expect(
      sink.items(),
      "it keeps the newest three and forgets the oldest two - when you cannot " +
        "keep up, which end you throw away is a decision, and the recent end is " +
        "almost always the one worth keeping",
    ).toEqual(["c", "d", "e"]);
    expect(sink.dropped(), "with an honest count of what was lost").toBe(2);

    const roomy = createLossySink({ capacity: 4 });
    roomy.write("x");
    roomy.write("y");
    await settle();
    expect(roomy.items(), "under capacity nothing is dropped").toEqual(["x", "y"]);
    expect(
      roomy.dropped(),
      "and the counter says so. A drop counter nobody can read is a drop " +
        "nobody knows about",
    ).toBe(0);

    await new Promise<void>((resolve) => roomy.end(() => resolve()));
    expect(roomy.writableEnded, "and it is still an ordinary writable that ends").toBe(true);
  });

  test("ex4 - createAsyncStage() does not let the source race ahead of the work", async () => {
    const started: string[] = [];
    const release = new Map<string, (value: string) => void>();
    const source = countingSource(["a", "b", "c", "d", "e", "f", "g", "h"], 1);
    const results: unknown[] = [];

    const run = pipeline(
      source.stream,
      createAsyncStage(async (item: string) => {
        started.push(item);
        return new Promise<string>((resolve) => release.set(item, resolve));
      }, { highWaterMark: 2 }),
      new Writable({
        objectMode: true,
        write(chunk, _encoding, callback) {
          results.push(chunk);
          callback();
        },
      }),
    );

    await settle();
    expect(
      started,
      "one call to fn is outstanding, not eight. Calling the transform " +
        "callback before fn has settled tells the stream you are ready for " +
        "more, and the whole source pours through you",
    ).toEqual(["a"]);
    expect(
      source.produced(),
      "and because the stage is not accepting chunks, the source has barely " +
        "been read. This number is the memory the pipeline is holding: if it " +
        "is 8 you have buffered the entire input to do one item of work",
    ).toBeLessThanOrEqual(5);

    release.get("a")?.("A");
    await settle();
    expect(started, "one settling lets exactly one more start").toEqual(["a", "b"]);
    expect(results, "and its result is downstream").toEqual(["A"]);

    for (const item of ["b", "c", "d", "e", "f", "g", "h"]) {
      release.get(item)?.(item.toUpperCase());
      await settle();
    }
    await run;
    expect(results, "everything comes out, in input order").toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
    ]);
  });

  test("ex5 - pumpWithHysteresis() pauses high and resumes low", async () => {
    const sink = heldSink({ highWaterMark: 100 });
    const items = Array.from({ length: 12 }, (_, index) => `item-${index}`);

    const run = pumpWithHysteresis(Readable.from(items), sink.stream, {
      pauseAbove: 3,
      resumeBelow: 2,
    });

    let done = false;
    const report = run.then((value) => {
      done = true;
      return value;
    });

    // Flush the sink one chunk at a time. A bounded loop, not a timeout.
    for (let turn = 0; turn < 200 && !done; turn += 1) {
      sink.releaseOne();
      await settle();
    }

    const result = await report;
    expect(
      sink.received,
      "everything arrived, in order - pausing a source is not the same as " +
        "dropping from it",
    ).toEqual(items);
    expect(result.written, "and the report agrees about how much there was").toBe(12);
    expect(
      result.maxBuffered,
      "the sink never held more than one chunk past the ceiling. The sink " +
        "highWaterMark here is 100, so nothing but your own pause is keeping " +
        "this number down",
    ).toBeLessThanOrEqual(4);
    expect(
      result.pauses,
      "and it really did pause at least once. A pump that never pauses passes " +
        "the first assertion by accident whenever the sink happens to keep up",
    ).toBeGreaterThanOrEqual(1);
  });

  test("ex6 - writeAllOrAbort() stops writing the moment it is cancelled", async () => {
    const untouched = heldSink({ highWaterMark: 4 });
    await expect(
      writeAllOrAbort(
        untouched.stream,
        ["a", "b", "c"],
        AbortSignal.abort(new Error("cancelled up front")),
      ),
      "an already-aborted signal rejects with its reason",
    ).rejects.toThrow("cancelled up front");
    expect(
      untouched.received,
      "having written nothing at all. Checking the signal only inside the loop " +
        "still writes the first chunk, and for an upload that is the whole file " +
        "header on its way to a request nobody wants any more",
    ).toEqual([]);

    const landed: unknown[] = [];
    const steady = new Writable({
      objectMode: true,
      highWaterMark: 2,
      write(chunk, _encoding, callback) {
        landed.push(chunk);
        // A sink that costs a turn of the loop per chunk.
        setImmediate(callback);
      },
    });
    const controller = new AbortController();
    await writeAllOrAbort(steady, ["p", "q", "r", "s", "t"], controller.signal);
    expect(landed, "with nobody cancelling, everything is written in order").toEqual([
      "p",
      "q",
      "r",
      "s",
      "t",
    ]);
    expect(
      getEventListeners(controller.signal, "abort").length,
      "and the abort listener is gone. One left behind per call is how a " +
        "long-lived signal collects a MaxListenersExceededWarning",
    ).toBe(0);

    const slow = heldSink({ highWaterMark: 1 });
    const cancelled = new AbortController();
    const stopping = writeAllOrAbort(
      slow.stream,
      ["1", "2", "3", "4", "5", "6"],
      cancelled.signal,
    );
    await settle();
    expect(
      slow.received,
      "one chunk in flight and the writer is waiting for a drain",
    ).toEqual(["1"]);

    cancelled.abort(new Error("user cancelled"));
    await expect(
      stopping,
      "the rejection is immediate: it does not wait for the drain that the " +
        "held sink is never going to send",
    ).rejects.toThrow("user cancelled");
    expect(
      slow.heldCount(),
      "and the sink is still holding the chunk it had - the point is that you " +
        "stopped, not that you flushed",
    ).toBe(1);
    expect(
      getEventListeners(cancelled.signal, "abort").length,
      "the listener is removed on the failure path too",
    ).toBe(0);
  });

  test("ex7 - createBatchingWriter() collects while the sink is busy", async () => {
    const sink = heldSink({ highWaterMark: 1 });
    const writer = createBatchingWriter(sink.stream, { maxBatch: 3 });

    writer.write("a");
    await settle();
    expect(
      sink.received,
      "the first item goes straight through - batching is not delaying, it is " +
        "using the time you were going to spend waiting anyway",
    ).toEqual([["a"]]);

    for (const item of ["b", "c", "d", "e", "f"]) writer.write(item);
    await settle();
    expect(
      sink.received,
      "while the sink is busy nothing more is sent to it. Writing regardless " +
        "is how the sink queue becomes the buffer you were trying to avoid",
    ).toEqual([["a"]]);

    const done = writer.end();
    sink.releaseOne();
    await settle();
    expect(
      sink.received,
      "when the sink comes free, the waiting items go as ONE write - capped at " +
        "maxBatch, so a long stall does not turn into a single enormous batch",
    ).toEqual([["a"], ["b", "c", "d"]]);

    sink.releaseOne();
    await settle();
    expect(sink.received, "and the rest follow in the next batch").toEqual([
      ["a"],
      ["b", "c", "d"],
      ["e", "f"],
    ]);

    sink.releaseOne();
    await done;
    expect(
      sink.stream.writableEnded,
      "end() flushes the remainder and then ends the sink - and the promise it " +
        "returns does not settle until all of that has landed",
    ).toBe(true);
  });

  test("ex8 - balanceAcross() sends work where there is room for it", async () => {
    const stuck = heldSink({ highWaterMark: 2 });
    const freeReceived: unknown[] = [];
    const free = new Writable({
      objectMode: true,
      highWaterMark: 2,
      write(chunk, _encoding, callback) {
        freeReceived.push(chunk);
        callback();
      },
    });

    const lopsided = balanceAcross(
      countingSource(["a", "b", "c", "d", "e", "f", "g", "h"], 1).stream,
      [stuck.stream, free],
    );
    await settle();
    expect(
      stuck.stream.writableLength,
      "the stuck sink filled to its highWaterMark and was then left alone. " +
        "Round-robin would have handed it four of the eight and blocked",
    ).toBeLessThanOrEqual(2);

    for (let turn = 0; turn < 50 && stuck.heldCount() > 0; turn += 1) {
      stuck.releaseAll();
      await settle();
    }
    const counts = await lopsided;
    expect(counts[0], "at most a bufferful went to the sink that was not moving").toBeLessThanOrEqual(2);
    expect(
      counts[1],
      "and everything else went to the one that was. Choosing by writableLength " +
        "is what makes this adaptive - the slow consumer is discovered, not " +
        "configured",
    ).toBeGreaterThanOrEqual(6);
    expect(counts[0] + counts[1], "every chunk landed exactly once").toBe(8);
    expect(
      freeReceived.length,
      "the free sink really did receive them, not just get credited for them",
    ).toBe(counts[1]);

    const first = heldSink({ highWaterMark: 2 });
    const second = heldSink({ highWaterMark: 2 });
    const source = countingSource(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], 1);
    let finished = false;
    const blocked = balanceAcross(source.stream, [first.stream, second.stream]).then(
      (value) => {
        finished = true;
        return value;
      },
    );
    await settle();

    expect(
      first.stream.writableLength + second.stream.writableLength,
      "with every sink saturated the pump STOPS. Two sinks of two is four " +
        "chunks of memory, and that has to be the whole cost however long the " +
        "source is",
    ).toBeLessThanOrEqual(4);
    expect(
      source.produced(),
      "which means the source has barely been read either - backpressure that " +
        "does not reach the source is not backpressure",
    ).toBeLessThanOrEqual(7);
    expect(finished, "and it is still going").toBe(false);

    for (let turn = 0; turn < 100 && !finished; turn += 1) {
      first.releaseAll();
      second.releaseAll();
      await settle();
    }
    const shared = await blocked;
    expect(shared[0] + shared[1], "once the sinks move, everything lands").toBe(10);
    expect(
      first.received.length > 0 && second.received.length > 0,
      "and both of them did some of the work",
    ).toBe(true);
  });
});
