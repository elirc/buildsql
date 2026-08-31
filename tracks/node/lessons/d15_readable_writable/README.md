# d15 — Readable and Writable

Eight problems on building and consuming streams, drawn from lesson
**06_buffers_streams** — the stream half. Lesson 06 had you write one source and
one sink; this set drills the shapes those two come in: ranges, drains, budgets,
early stops, concatenation, pagination, merging, and the in-memory socket pair.
Transforms and `pipeline()` chains belong to lesson 07 and to **d16**;
backpressure proper belongs to **d17**. If `push(null)` does not feel like
second nature yet, redo lesson 06 ex3 first.

Everything here is in memory and driven by hand. The gate pushes into sources it
controls, settles the event loop a fixed number of turns, and grades laziness
with flags planted inside `read()` implementations — never with a clock.

## Problem 1 — a source you build yourself

Edit `ex1/solution.ts`. `createRangeStream(from, to, step)` is an **object-mode**
Readable producing `from`, `from + step`, ... up to and including `to` when the
step lands on it. An empty range (`from > to`) ends immediately rather than
hanging.

```
uv run dojo test node d15_readable_writable ex1
```

## Problem 2 — the whole stream, or the real error

Edit `ex2/solution.ts`. `toArray(readable)` collects any object-mode Readable
into an array, in order. An empty stream is `[]`. A stream that errors part way
through **rejects** with that error — never resolves with a partial array.

```
uv run dojo test node d15_readable_writable ex2
```

## Problem 3 — a sink with a budget

Edit `ex3/solution.ts`. `createBoundedSink(limit)` returns `{ writable, bytes }`.
The sink accepts chunks until one would take the total **past** `limit` bytes —
landing exactly on it is fine — then fails that write with an error naming the
limit. `bytes()` reports what was actually accepted, and a `pipeline()` feeding
the sink rejects.

```
uv run dojo test node d15_readable_writable ex3
```

## Problem 4 — take what you need, stop the rest

Edit `ex4/solution.ts`. `takeFrom(readable, n)` resolves with the first `n`
items and **destroys the source**, so it stops producing. A stream shorter than
`n` yields what it has, without error.

```
uv run dojo test node d15_readable_writable ex4
```

## Problem 5 — one stream after another, not all at once

Edit `ex5/solution.ts`. `concatStreams(sources)` yields everything from the
first source, then the second, and so on. Each source is only **started** once
the one before it has ended, and an error in any source destroys the joined
stream with that error.

```
uv run dojo test node d15_readable_writable ex5
```

## Problem 6 — a paginated API wearing a stream

Edit `ex6/solution.ts`. `createPagedSource(fetchPage)` is an object-mode
Readable over an injected `fetchPage(cursor)` returning `{ items, next }`: first
call with `null`, then each `next`, **one call at a time**, ending after the
page whose `next` is null. A rejected fetch destroys the stream with that error.

```
uv run dojo test node d15_readable_writable ex6
```

## Problem 7 — many sources, one stream

Edit `ex7/solution.ts`. `mergeStreams(sources)` interleaves every source into
one object-mode Readable as items are produced. It ends when **all** sources
have ended; the first error destroys the other sources and propagates. No
sources at all ends immediately.

```
uv run dojo test node d15_readable_writable ex7
```

## Problem 8 — a socket pair with no socket

Edit `ex8/solution.ts`. `createDuplexPair()` returns `[a, b]`, two Duplex
streams wired crosswise: what is written to `a` is readable from `b` and vice
versa, the two directions are independent, and `end()`ing one side ends the
**other** side's readable half while its own writable half keeps working.

```
uv run dojo test node d15_readable_writable ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d15_readable_writable. Quoted verbatim in README.md.
//
// Every stream here is in memory and driven by hand: the gate pushes into
// sources it controls and settles the event loop a fixed number of turns, so
// nothing depends on how fast the machine is. Laziness is graded by FLAGS the
// gate sets in read() implementations, and shutdown by the destroyed property -
// never by elapsed time.
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { describe, expect, test } from "vitest";

import { createRangeStream } from "./ex1/solution";
import { toArray } from "./ex2/solution";
import { createBoundedSink } from "./ex3/solution";
import { takeFrom } from "./ex4/solution";
import { concatStreams } from "./ex5/solution";
import { createPagedSource } from "./ex6/solution";
import { mergeStreams } from "./ex7/solution";
import { createDuplexPair } from "./ex8/solution";

/** A fixed number of event-loop turns - enough for any push to propagate. */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

/** The gate drains streams with its own loop so no exercise grades another. */
async function drain(source: Readable): Promise<unknown[]> {
  const items: unknown[] = [];
  for await (const item of source) items.push(item);
  return items;
}

describe("d15_readable_writable", () => {
  test("ex1 - createRangeStream() counts up in object mode and knows when it is done", async () => {
    const stream = createRangeStream(2, 8, 2);
    expect(
      stream.readableObjectMode,
      "the stream is in OBJECT mode - without it, every number you push is " +
        "coerced into a Buffer and comes out the other end as bytes",
    ).toBe(true);

    const items = await drain(stream);
    expect(
      items,
      "from 2 up to and including 8, stepping by 2 - the end of the range is " +
        "part of the range when the step lands on it",
    ).toEqual([2, 4, 6, 8]);
    expect(
      items.every((item) => typeof item === "number"),
      "and they are still numbers, which is the whole point of object mode",
    ).toBe(true);

    expect(
      await drain(createRangeStream(1, 9, 3)),
      "a step that overshoots the end stops before it",
    ).toEqual([1, 4, 7]);

    expect(
      await drain(createRangeStream(3, 3, 1)),
      "a range of one is one item, not zero",
    ).toEqual([3]);

    expect(
      await drain(createRangeStream(5, 1, 2)),
      "an empty range ends immediately. If this hangs, the stream never " +
        "pushed null - an end you never signal is a consumer that waits forever",
    ).toEqual([]);
  });

  test("ex2 - toArray() drains a stream and refuses to pretend on error", async () => {
    expect(
      await toArray(Readable.from(["alpha", "beta", "gamma"])),
      "every item, in order, one array",
    ).toEqual(["alpha", "beta", "gamma"]);

    expect(
      await toArray(Readable.from([])),
      "an empty stream is an empty array, not undefined and not a hang",
    ).toEqual([]);

    let calls = 0;
    const failing = new Readable({
      objectMode: true,
      read() {
        calls += 1;
        if (calls <= 2) this.push(calls);
        else this.destroy(new Error("upstream broke"));
      },
    });
    await expect(
      toArray(failing),
      "a stream that errors part way through must REJECT, not resolve with " +
        "the two items that made it - a partial array that looks complete is " +
        "worse than a failure, because nothing downstream knows to distrust it",
    ).rejects.toThrow("upstream broke");
  });

  test("ex3 - createBoundedSink() stops accepting when the budget runs out", async () => {
    const roomy = createBoundedSink(100);
    await pipeline(
      Readable.from([Buffer.alloc(4), Buffer.alloc(4), Buffer.alloc(4)]),
      roomy.writable,
    );
    expect(
      roomy.bytes(),
      "under the limit, everything is accepted and counted",
    ).toBe(12);

    const exact = createBoundedSink(12);
    await pipeline(
      Readable.from([Buffer.alloc(4), Buffer.alloc(4), Buffer.alloc(4)]),
      exact.writable,
    );
    expect(
      exact.bytes(),
      "landing exactly ON the limit is allowed - the sink refuses to go over " +
        "it, not to reach it",
    ).toBe(12);

    const tight = createBoundedSink(10);
    await expect(
      pipeline(
        Readable.from([Buffer.alloc(4), Buffer.alloc(4), Buffer.alloc(4)]),
        tight.writable,
      ),
      "the third chunk would make 12 of a budget of 10, so the sink fails the " +
        "write and pipeline() rejects. This is how you cap an upload: the " +
        "alternative is buffering until the heap is the limit",
    ).rejects.toThrow(/10/);
    expect(
      tight.bytes(),
      "the two chunks that fit were accepted; the one that did not was never " +
        "counted",
    ).toBe(8);
  });

  test("ex4 - takeFrom() takes what it needs and shuts the source down", async () => {
    let produced = 0;
    const source = new Readable({
      objectMode: true,
      highWaterMark: 1,
      read() {
        produced += 1;
        this.push(produced <= 100 ? produced : null);
      },
    });

    expect(
      await takeFrom(source, 3),
      "the first three items, in order",
    ).toEqual([1, 2, 3]);
    expect(
      produced,
      "the source produced the three you took plus at most a little " +
        "read-ahead. If this number is 100, you drained the whole stream and " +
        "threw away 97 items - taking is not filtering",
    ).toBeLessThanOrEqual(6);
    expect(
      source.destroyed,
      "and the source was destroyed, so it stops producing and lets go of " +
        "whatever it holds. Breaking out of a for-await does this for you; a " +
        "hand-rolled data listener does not",
    ).toBe(true);

    expect(
      await takeFrom(Readable.from([10, 20]), 5),
      "asking for more than the stream has is not an error - you get " +
        "everything there was",
    ).toEqual([10, 20]);
  });

  test("ex5 - concatStreams() plays the sources in order and starts each one late", async () => {
    let secondRead = false;
    const first = new Readable({ objectMode: true, read() {} });
    const second = new Readable({
      objectMode: true,
      read() {
        secondRead = true;
      },
    });

    const joined = concatStreams([first, second]);
    const seen: unknown[] = [];
    const consumed = (async () => {
      for await (const item of joined) seen.push(item);
    })();

    first.push("f1");
    first.push("f2");
    await settle();
    expect(seen, "items flow through while the first source is still open").toEqual([
      "f1",
      "f2",
    ]);
    expect(
      secondRead,
      "the second source has not been touched. Starting every source up front " +
        "means holding them all open at once - a concat of file streams would " +
        "open every file on the first read",
    ).toBe(false);

    first.push(null);
    await settle();
    expect(
      secondRead,
      "the first source ending is what starts the second",
    ).toBe(true);

    second.push("s1");
    second.push("s2");
    second.push(null);
    await consumed;
    expect(
      seen,
      "everything from the first source, then everything from the second, in " +
        "order - a concat, not a merge",
    ).toEqual(["f1", "f2", "s1", "s2"]);

    const healthy = Readable.from(["one"]);
    const snapping = new Readable({
      objectMode: true,
      read() {
        this.destroy(new Error("tape snapped"));
      },
    });
    await expect(
      drain(concatStreams([healthy, snapping])),
      "an error in any source must destroy the joined stream with that error " +
        "- swallowing it and just ending early turns a failure into a " +
        "truncation nobody notices",
    ).rejects.toThrow("tape snapped");
  });

  test("ex6 - createPagedSource() fetches a page at a time and never two at once", async () => {
    const pages: Record<string, { items: string[]; next: string | null }> = {
      start: { items: ["r1", "r2"], next: "c1" },
      c1: { items: ["r3", "r4"], next: "c2" },
      c2: { items: ["r5", "r6"], next: null },
    };
    const cursors: (string | null)[] = [];
    const fetchPage = async (cursor: string | null) => {
      cursors.push(cursor);
      return pages[cursor ?? "start"];
    };

    const source = createPagedSource(fetchPage);
    const iterator = source[Symbol.asyncIterator]();

    const firstTwo = [(await iterator.next()).value, (await iterator.next()).value];
    expect(firstTwo, "the first page, item by item").toEqual(["r1", "r2"]);
    expect(
      cursors.length,
      "after consuming one page, at most two fetches have happened - the page " +
        "you read and perhaps one of read-ahead. A source that fetched all " +
        "three pages up front is a download pretending to be a stream",
    ).toBeLessThanOrEqual(2);

    const rest: unknown[] = [];
    for (;;) {
      const next = await iterator.next();
      if (next.done) break;
      rest.push(next.value);
    }
    expect(rest, "then the rest, in order, ending after the last page").toEqual([
      "r3",
      "r4",
      "r5",
      "r6",
    ]);
    expect(
      cursors,
      "each cursor was fetched exactly once, in order: null first, then the " +
        "cursor each page handed back. A duplicate here means read() started a " +
        "second fetch while one was in flight",
    ).toEqual([null, "c1", "c2"]);

    const failing = createPagedSource(async () => {
      throw new Error("the api fell over");
    });
    await expect(
      drain(failing),
      "a rejected fetch destroys the stream with that error",
    ).rejects.toThrow("the api fell over");
  });

  test("ex7 - mergeStreams() interleaves sources and ends only when all of them end", async () => {
    const left = new Readable({ objectMode: true, read() {} });
    const right = new Readable({ objectMode: true, read() {} });
    const merged = mergeStreams([left, right]);

    const seen: unknown[] = [];
    merged.on("data", (item) => seen.push(item));
    let ended = false;
    merged.on("end", () => {
      ended = true;
    });

    left.push("l1");
    await settle();
    right.push("r1");
    await settle();
    left.push("l2");
    await settle();
    expect(
      seen,
      "items come through in the order the sources produced them, whichever " +
        "source they came from - that interleaving is what merge means",
    ).toEqual(["l1", "r1", "l2"]);

    left.push(null);
    await settle();
    expect(
      ended,
      "one source ending is not the merge ending - the other is still alive",
    ).toBe(false);

    right.push("r2");
    await settle();
    expect(seen, "and the survivor still delivers").toEqual(["l1", "r1", "l2", "r2"]);

    right.push(null);
    await settle();
    expect(ended, "all sources done is the end").toBe(true);

    expect(
      await drain(mergeStreams([])),
      "no sources at all ends immediately instead of waiting forever",
    ).toEqual([]);

    const ok = new Readable({ objectMode: true, read() {} });
    const bad = new Readable({ objectMode: true, read() {} });
    const doomed = mergeStreams([ok, bad]);
    const failure = new Promise<Error>((resolve) => {
      doomed.on("error", resolve);
    });
    doomed.on("data", () => {});
    bad.destroy(new Error("left the building"));
    expect((await failure).message, "the first error propagates").toBe("left the building");
    await settle();
    expect(
      ok.destroyed,
      "and the other sources are destroyed too - a merge that keeps reading " +
        "the survivors delivers into a stream nobody is listening to",
    ).toBe(true);
  });

  test("ex8 - createDuplexPair() wires two streams into an in-memory socket", async () => {
    const [a, b] = createDuplexPair();

    const fromB: Buffer[] = [];
    b.on("data", (chunk: Buffer) => fromB.push(chunk));
    const fromA: Buffer[] = [];
    a.on("data", (chunk: Buffer) => fromA.push(chunk));

    a.write("ping");
    await settle();
    expect(
      Buffer.concat(fromB).toString("utf8"),
      "what goes into one side comes out of the other",
    ).toBe("ping");
    expect(
      Buffer.isBuffer(fromB[0]),
      "as bytes - this is a socket pair, not an object channel",
    ).toBe(true);

    b.write("pong");
    b.write(" pong");
    await settle();
    expect(
      Buffer.concat(fromA).toString("utf8"),
      "the two directions are independent: b writes reach a",
    ).toBe("pong pong");
    expect(
      Buffer.concat(fromB).toString("utf8"),
      "...without echoing anything back to b",
    ).toBe("ping");

    let bEnded = false;
    b.on("end", () => {
      bEnded = true;
    });
    a.end("bye");
    await settle();
    expect(
      Buffer.concat(fromB).toString("utf8"),
      "the final chunk still arrives before the end",
    ).toBe("pingbye");
    expect(
      bEnded,
      "ending the writable half of a ends the READABLE half of b - that is " +
        "how the far side of a socket learns you have finished sending",
    ).toBe(true);

    b.write("still here");
    await settle();
    expect(
      Buffer.concat(fromA).toString("utf8"),
      "and the other direction is untouched: a half-closed pair still " +
        "carries data the other way, exactly like a real socket",
    ).toBe("pong pongstill here");
  });
});
```

In plain English:

- **ex1** drains three ranges and an empty one, and checks the items are still
  numbers.
- **ex2** collects a healthy stream, an empty one, and one that errors after two
  items — which must reject.
- **ex3** fills a roomy sink, lands exactly on a limit, then breaks a tight one
  and checks the refused chunk was never counted.
- **ex4** takes three items from a source that could produce a hundred, and
  counts how many were actually produced.
- **ex5** holds the first source open and checks the second was never read, then
  ends it and watches the second start.
- **ex6** logs every cursor `fetchPage` receives and requires each page exactly
  once, in order, at most one ahead of the consumer.
- **ex7** pushes into two live sources alternately, ends them one at a time, and
  errors one of a second pair to check the other is destroyed.
- **ex8** sends bytes both ways, half-closes one side, and checks the other
  direction still carries data.

Next: **d16_transform_pipeline**, where streams start changing what passes
through them.
