# d16 — Transform pipelines

Eight problems on the middle of a stream. Lesson **07_streams_2** taught the
`Transform` and what `pipeline()` does when a link fails; this set drills the
stages you end up writing again in every project — map, filter, batch, expand —
and then the two that are genuinely hard: keeping order while working in
parallel, and fanning one stream out to many destinations without leaving a file
handle behind.

Everything here is in memory, and nothing is graded by timing. Where a stage has
to run work in parallel the gate hands it deferreds it controls and releases
them by name, so "three were in flight" and "nothing came out until the first
one landed" are exact claims.

## Problem 1 — map

Edit `ex1/solution.ts`. `createMapStage(fn)` is an object-mode `Transform` that
pushes `fn(item)` for every item. A throw inside `fn` must fail the **stream** —
it may never escape as an uncaught exception.

```
uv run dojo test node d16_transform_pipeline ex1
```

## Problem 2 — filter, with a receipt

Edit `ex2/solution.ts`. `createFilterStage(predicate)` passes on the items the
predicate likes and drops the rest. The stream it returns also answers `kept()`
and `dropped()`.

```
uv run dojo test node d16_transform_pipeline ex2
```

## Problem 3 — the group is the unit

Edit `ex3/solution.ts`. `createBatchStage(size)` emits arrays of `size` items.
The short final batch is emitted when the input ends; an input whose length
divides exactly emits **no** trailing empty batch, and an empty input emits
nothing at all.

```
uv run dojo test node d16_transform_pipeline ex3
```

## Problem 4 — one in, many out

Edit `ex4/solution.ts`. `createExpandStage(fn)` pushes every element `fn(item)`
produces. `fn` may return an array or an async iterable, and an empty one drops
the item. The output of one input is drained fully before the next is accepted.

```
uv run dojo test node d16_transform_pipeline ex4
```

## Problem 5 — a stage that is just a function

Edit `ex5/solution.ts`. `asyncMapStage(fn)` returns an **async generator stage**
you can drop straight into `pipeline()`. It awaits `fn` per item, one at a time,
yields in input order, and on a rejection stops pulling from the source.

```
uv run dojo test node d16_transform_pipeline ex5
```

## Problem 6 — one source, several destinations

Edit `ex6/solution.ts`. `tee(source, sinks)` sends every item to every sink and
resolves when all of them have finished. If any sink fails it rejects with that
error and destroys the source and every other sink.

```
uv run dojo test node d16_transform_pipeline ex6
```

## Problem 7 — parallel work, sequential output

Edit `ex7/solution.ts`. `createOrderedParallelStage(worker, limit)` keeps at
most `limit` calls to `worker` in flight and emits their results in **input**
order, whatever order they finish in. A rejection fails the stream.

```
uv run dojo test node d16_transform_pipeline ex7
```

## Problem 8 — one stream in, many files out

Edit `ex8/solution.ts`. `partitionTo(source, keyOf, openSink)` routes each item
to the sink its key names, calling `openSink(key)` at most **once per key**. It
ends every sink when the source runs out and resolves with the per-key counts;
on any failure it destroys them all and rejects.

```
uv run dojo test node d16_transform_pipeline ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d16_transform_pipeline. Quoted verbatim in README.md.
//
// Every stream here is in memory and every claim about concurrency is graded by
// COUNTING, never by timing. Where a stage has to run work in parallel the gate
// hands it deferreds it controls and releases them by name, so "how many were in
// flight" and "what came out first" are exact numbers on any machine.
import { Readable, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { describe, expect, test } from "vitest";

import { createMapStage } from "./ex1/solution";
import { createFilterStage } from "./ex2/solution";
import { createBatchStage } from "./ex3/solution";
import { createExpandStage } from "./ex4/solution";
import { asyncMapStage } from "./ex5/solution";
import { tee } from "./ex6/solution";
import { createOrderedParallelStage } from "./ex7/solution";
import { partitionTo } from "./ex8/solution";

/** Hand the loop back a fixed number of times. A count of turns, not a delay. */
async function settle(): Promise<void> {
  for (let turn = 0; turn < 8; turn += 1) {
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

/** An object-mode sink that keeps what it was given. */
function objectSink(): { stream: Writable; items: unknown[] } {
  const items: unknown[] = [];
  const stream = new Writable({
    objectMode: true,
    write(chunk, _encoding, callback) {
      items.push(chunk);
      callback();
    },
  });
  return { stream, items };
}

/** A source that hands over its items and then stays open for ever. */
function openSource(items: unknown[]): Readable {
  let index = 0;
  return new Readable({
    objectMode: true,
    read() {
      if (index < items.length) {
        this.push(items[index]);
        index += 1;
      }
      // ...and once they run out it pushes nothing and never ends, so the only
      // way this stream closes is somebody destroying it.
    },
  });
}

/** A unit of work the gate can start, count and release by name. */
function workshop<T = string>() {
  const started: string[] = [];
  const releases = new Map<string, (value: T) => void>();
  const fails = new Map<string, (reason: unknown) => void>();
  let active = 0;
  let maxActive = 0;

  const work = (name: string): Promise<T> => {
    started.push(name);
    active += 1;
    maxActive = Math.max(maxActive, active);
    return new Promise<T>((resolve, reject) => {
      releases.set(name, (value: T) => {
        active -= 1;
        resolve(value);
      });
      fails.set(name, (reason: unknown) => {
        active -= 1;
        reject(reason);
      });
    });
  };

  return {
    work,
    started,
    release: (name: string, value: T) => releases.get(name)?.(value),
    fail: (name: string, reason: unknown) => fails.get(name)?.(reason),
    maxActive: () => maxActive,
  };
}

describe("d16_transform_pipeline", () => {
  test("ex1 - createMapStage() transforms every item and fails the stream honestly", async () => {
    const out = objectSink();
    await pipeline(
      Readable.from([1, 2, 3]),
      createMapStage((n: number) => n * 2),
      out.stream,
    );
    expect(
      out.items,
      "every item goes through fn and comes out the other side, in order",
    ).toEqual([2, 4, 6]);

    const doomed = objectSink();
    await expect(
      pipeline(
        Readable.from(["ok", "poison", "never"]),
        createMapStage((word: string) => {
          if (word === "poison") throw new Error("cannot map poison");
          return word.toUpperCase();
        }),
        doomed.stream,
      ),
      "a throw inside fn has to become a STREAM error - hand it to the " +
        "transform callback. Letting it escape transform() is an uncaught " +
        "exception on the next tick, which no caller can catch and which takes " +
        "the process with it",
    ).rejects.toThrow("cannot map poison");

    expect(
      doomed.items,
      "and the items that were mapped before the failure still arrived - a " +
        "stream that fails half way through has still done half the work",
    ).toEqual(["OK"]);
  });

  test("ex2 - createFilterStage() drops items by saying nothing about them", async () => {
    const out = objectSink();
    const evens = createFilterStage((n: number) => n % 2 === 0);
    await pipeline(Readable.from([1, 2, 3, 4, 5, 6]), evens, out.stream);

    expect(
      out.items,
      "the survivors, in order. Dropping is not pushing: there is no filter " +
        "callback, you simply do not call push",
    ).toEqual([2, 4, 6]);
    expect(evens.kept(), "three passed the predicate").toBe(3);
    expect(
      evens.dropped(),
      "and three did not. A filter that cannot say how much it threw away is a " +
        "filter nobody can debug",
    ).toBe(3);

    const nothing = objectSink();
    const strict = createFilterStage(() => false);
    await pipeline(Readable.from([1, 2]), strict, nothing.stream);
    expect(
      nothing.items,
      "a stage that keeps nothing still has to END. If you forget the " +
        "callback on the dropped path the stream stalls for ever, and a stall " +
        "looks exactly like a slow upstream",
    ).toEqual([]);
    expect(strict.dropped(), "with both of them counted").toBe(2);
  });

  test("ex3 - createBatchStage() groups items and does not lose the remainder", async () => {
    const out = objectSink();
    await pipeline(Readable.from([1, 2, 3, 4, 5]), createBatchStage(2), out.stream);
    expect(
      out.items,
      "full batches as they fill, and the short last one when the input ends. " +
        "The remainder is what _flush is for - without it the last group is " +
        "silently dropped, which is the batching bug that reaches production",
    ).toEqual([[1, 2], [3, 4], [5]]);

    const exact = objectSink();
    await pipeline(Readable.from([1, 2, 3, 4]), createBatchStage(2), exact.stream);
    expect(
      exact.items,
      "when the count divides exactly there is no trailing empty batch - flush " +
        "has to check before it pushes",
    ).toEqual([[1, 2], [3, 4]]);

    const empty = objectSink();
    await pipeline(Readable.from([]), createBatchStage(3), empty.stream);
    expect(empty.items, "no items, no batches - not even one empty array").toEqual([]);
  });

  test("ex4 - createExpandStage() turns one item into as many as it likes", async () => {
    const out = objectSink();
    await pipeline(
      Readable.from(["ab", "skip", "cd"]),
      createExpandStage((word: string) => (word === "skip" ? [] : word.split(""))),
      out.stream,
    );
    expect(
      out.items,
      "one in, many out - and an empty array means the item is dropped. " +
        "Pushing the array itself instead of its elements is the mistake: that " +
        "is a map, not an expand",
    ).toEqual(["a", "b", "c", "d"]);

    const streamed = objectSink();
    await pipeline(
      Readable.from([2, 3]),
      createExpandStage(async function* (n: number) {
        for (let i = 1; i <= n; i += 1) yield `${n}.${i}`;
      }),
      streamed.stream,
    );
    expect(
      streamed.items,
      "an async iterable works too, and its items are drained before the next " +
        "input is accepted - otherwise the outputs interleave and the order is " +
        "gone",
    ).toEqual(["2.1", "2.2", "3.1", "3.2", "3.3"]);
  });

  test("ex5 - asyncMapStage() awaits one at a time and keeps the input order", async () => {
    const shop = workshop();
    const out = objectSink();
    const run = pipeline(
      Readable.from(["a", "b", "c"]),
      asyncMapStage((item: string) => shop.work(item)),
      out.stream,
    );

    await settle();
    expect(
      shop.started,
      "one at a time. A stage that starts everything and collects afterwards " +
        "has quietly become an unbounded fan-out, and the first thing it does " +
        "in production is open ten thousand connections",
    ).toEqual(["a"]);
    expect(out.items, "and nothing is out yet").toEqual([]);

    shop.release("a", "A");
    await settle();
    expect(shop.started, "the next one starts only once the first has landed").toEqual([
      "a",
      "b",
    ]);
    expect(out.items, "and the first result is through").toEqual(["A"]);

    shop.release("b", "B");
    await settle();
    shop.release("c", "C");
    await run;
    expect(out.items, "in input order, which is free when you await in the loop").toEqual([
      "A",
      "B",
      "C",
    ]);

    const attempted: string[] = [];
    const doomed = objectSink();
    await expect(
      pipeline(
        Readable.from(["p", "q", "r"]),
        asyncMapStage(async (item: string) => {
          attempted.push(item);
          if (item === "q") throw new Error("q is unmappable");
          return item.toUpperCase();
        }),
        doomed.stream,
      ),
      "a rejection fails the pipeline",
    ).rejects.toThrow("q is unmappable");
    expect(
      attempted,
      "and it stops consuming - r is never even looked at. A for-await loop " +
        "that throws stops pulling, and that is the whole reason to write the " +
        "stage as a generator",
    ).toEqual(["p", "q"]);
  });

  test("ex6 - tee() gives every sink everything, or tears the whole lot down", async () => {
    const first = objectSink();
    const second = objectSink();
    await tee(Readable.from([1, 2, 3]), [first.stream, second.stream]);

    expect(first.items, "every sink sees every item").toEqual([1, 2, 3]);
    expect(
      second.items,
      "...all of them, in order. A tee that pipes the same readable into two " +
        "sinks with .pipe() gives the second one whatever is left after the " +
        "first has taken its share",
    ).toEqual([1, 2, 3]);

    const survivor = objectSink();
    const source = openSource(["one", "two", "three"]);
    let writes = 0;
    const broken = new Writable({
      objectMode: true,
      write(_chunk, _encoding, callback) {
        writes += 1;
        callback(writes === 2 ? new Error("the second write failed") : null);
      },
    });

    await expect(
      tee(source, [survivor.stream, broken]),
      "one failing sink fails the call, with that sink error",
    ).rejects.toThrow("the second write failed");

    expect(
      source.destroyed,
      "and the source is destroyed. This source never ends on its own, so if " +
        "nobody tears it down it sits there holding its socket for the rest of " +
        "the process",
    ).toBe(true);
    expect(
      survivor.stream.destroyed,
      "so is the sink that did nothing wrong - a half-written output file is " +
        "worse than no output file, because it looks finished",
    ).toBe(true);
  });

  test("ex7 - createOrderedParallelStage() runs several at once and still emits in order", async () => {
    const shop = workshop();
    const out = objectSink();
    const run = pipeline(
      Readable.from(["a", "b", "c", "d"]),
      createOrderedParallelStage((item: string) => shop.work(item), 3),
      out.stream,
    );

    await settle();
    expect(
      shop.started,
      "three in flight, and the fourth waits. The limit is the point: without " +
        "it this is Promise.all over the whole stream and the stream stops " +
        "being a stream",
    ).toEqual(["a", "b", "c"]);

    shop.release("c", "C");
    await settle();
    expect(
      out.items,
      "c finished first and NOTHING came out. Order is a promise the stage " +
        "makes to whatever is downstream: emitting on completion is a " +
        "different function with a different name",
    ).toEqual([]);

    shop.release("a", "A");
    await settle();
    expect(out.items, "the head landing releases the head, and only the head").toEqual(["A"]);
    expect(
      shop.started,
      "...and the freed slot immediately starts the next item, rather than " +
        "waiting for the whole batch",
    ).toEqual(["a", "b", "c", "d"]);

    shop.release("b", "B");
    await settle();
    expect(
      out.items,
      "b was already behind c, so both of them come out at once, still in " +
        "input order",
    ).toEqual(["A", "B", "C"]);

    shop.release("d", "D");
    await run;
    expect(out.items, "and the last one arrives at the end").toEqual(["A", "B", "C", "D"]);
    expect(
      shop.maxActive(),
      "the limit held for the whole run - never a fourth worker",
    ).toBeLessThanOrEqual(3);

    const attempted: string[] = [];
    const doomed = objectSink();
    await expect(
      pipeline(
        Readable.from(["p", "q", "r", "s"]),
        createOrderedParallelStage(async (item: string) => {
          attempted.push(item);
          if (item === "q") throw new Error("q blew up");
          return item.toUpperCase();
        }, 2),
        doomed.stream,
      ),
      "a worker that rejects fails the stream rather than being skipped",
    ).rejects.toThrow("q blew up");
    expect(
      attempted.includes("s"),
      "and nothing further is started once it has failed",
    ).toBe(false);
  });

  test("ex8 - partitionTo() opens one sink per key and closes all of them", async () => {
    const opened: string[] = [];
    const made = new Map<string, { stream: Writable; items: unknown[] }>();
    const openSink = (key: string): Writable => {
      opened.push(key);
      const sink = objectSink();
      made.set(key, sink);
      return sink.stream;
    };

    const counts = await partitionTo(
      Readable.from([
        { region: "eu", id: 1 },
        { region: "us", id: 2 },
        { region: "eu", id: 3 },
      ]),
      (row: { region: string }) => row.region,
      openSink,
    );

    expect(
      opened,
      "one sink per DISTINCT key, opened the first time that key is seen. " +
        "Opening one per item is how a partitioned export ends up with four " +
        "million files",
    ).toEqual(["eu", "us"]);
    expect(counts, "and the tally of what went where").toEqual({ eu: 2, us: 1 });
    expect(
      made.get("eu")?.items,
      "each row went to the sink its key names, in order",
    ).toEqual([
      { region: "eu", id: 1 },
      { region: "eu", id: 3 },
    ]);
    expect(made.get("us")?.items, "and the other key got only its own").toEqual([
      { region: "us", id: 2 },
    ]);
    expect(
      made.get("eu")?.stream.writableEnded,
      "every sink is ended when the source runs out, and the call does not " +
        "resolve until they have all finished - resolving early is how the " +
        "last few rows never reach the disk",
    ).toBe(true);
    expect(made.get("us")?.stream.writableEnded, "both of them").toBe(true);

    const survivors: Writable[] = [];
    const boom = Readable.from(
      (async function* () {
        yield { region: "eu", id: 1 };
        throw new Error("the source gave up");
      })(),
    );

    await expect(
      partitionTo(
        boom,
        (row: { region: string }) => row.region,
        () => {
          const sink = objectSink();
          survivors.push(sink.stream);
          return sink.stream;
        },
      ),
      "a source that fails fails the call",
    ).rejects.toThrow("the source gave up");

    expect(
      survivors.every((sink) => sink.destroyed),
      "and every sink it had already opened is destroyed rather than left " +
        "open. These are file handles: the difference between destroying them " +
        "and ending them is the difference between an abandoned partial file " +
        "and one that claims to be complete",
    ).toBe(true);
  });
});
```

In plain English:

- **ex1** maps three numbers, then throws inside `fn` and checks the pipeline
  rejects and the earlier item still arrived.
- **ex2** filters evens, reads both counters, then filters everything away and
  checks the stream still ends.
- **ex3** batches five items into 2+2+1, then four into 2+2 with no trailing
  `[]`, then nothing into nothing.
- **ex4** expands strings into characters with one item dropped, then does it
  again with an async generator.
- **ex5** holds each call open and checks only one is ever outstanding, then
  fails the second of three and checks the third was never reached.
- **ex6** tees into two sinks, then fails the second sink's second write and
  checks the source and the innocent sink were destroyed.
- **ex7** releases the third worker before the first and checks nothing came
  out, then releases the first and watches the queue unblock in order.
- **ex8** partitions three rows across two keys and checks one sink per key,
  then fails the source and checks the sink it had opened was destroyed.

Next: **d17_backpressure**, where the question is not what the stages do but how
much they are allowed to hold.
