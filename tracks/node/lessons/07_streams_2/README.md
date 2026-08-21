# 07 — Transforms and pipelines

Lesson 06 gave you the two ends of a stream: a source that produces chunks and
a sink that consumes them. This lesson is about the middle, which is where all
the interesting work happens. A `Transform` sits between them — bytes in,
something else out — and once you can write one, "process a file too big for
memory" stops being a special project and becomes three lines of assembly.

The other half of this lesson is `pipeline()`, and it is not a stylistic
preference. `a.pipe(b).pipe(c)` looks like a pipeline and is not one: if `b`
fails, `a` keeps reading and `c` never finds out, so you are left with a
half-written file, a socket that is never closed and a process that does not
exit. Every one of those bugs has shipped, repeatedly, which is why Node added
`pipeline` and why the streams documentation now recommends never using
`.pipe()` in production code.

By the end of this lesson you will have written a Transform with state (a line
splitter that survives chunk boundaries), a transform that is nothing but an
async generator, and a three-stage pipeline that turns a CSV stream into
filtered JSON lines while holding one line in memory at a time.

## Concept — the middle of the pipe

A `Transform` is a `Duplex` whose readable side is produced from its writable
side. You implement one method and optionally a second:

```ts
import { Transform } from "node:stream";

const doubler = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().repeat(2));   // push, and ask for the next
  },

  flush(callback) {
    this.push("\n--- end ---\n");                 // one last chunk, at the end
    callback();
  },
});
```

Three things to know about `transform`:

- **`callback(null, value)` is a push plus a ready signal.** You can also call
  `this.push(value)` as many times as you like and then `callback()` with no
  value — one chunk in can become zero, one, or many chunks out.
- **`callback()` with nothing means "consumed, nothing to emit yet".** That is
  how a buffering transform works: hold the partial data, emit when you have
  something complete.
- **`callback(error)` fails the stream.** Never `throw` out of `transform`;
  nothing useful catches it.

`flush(callback)` runs after the last chunk, before the readable side ends. It
is your only chance to emit whatever depends on having seen everything: the
final partial line, a closing bracket, a summary.

Then **object mode**, which is what makes transforms composable. A stream in
object mode carries JavaScript values instead of bytes, and a `Transform` can
be in different modes on each side:

```ts
new Transform({
  readableObjectMode: true,    // I emit objects
  // writable side stays in byte mode: I receive Buffers
});
```

That asymmetry is exactly what a parser is: bytes in, records out.

And the assembly:

```ts
import { pipeline } from "node:stream/promises";

await pipeline(source, splitLines, parseJson, filterRows, sink);
```

`pipeline` connects each stage to the next with backpressure, propagates
errors, **destroys every stage** if any of them fails or the consumer goes
away, and resolves when the sink has finished. The promise version is in
`node:stream/promises`; there is a callback version in `node:stream` too.

One more form, and it is the one modern code reaches for: a stage can be an
**async generator function**.

```ts
async function* onlyErrors(source) {
  for await (const line of source) {
    if (line.includes("ERROR")) yield line;
  }
}

await pipeline(logFile, splitLines, onlyErrors, sink);
```

No class, no callbacks, no `push` — and backpressure still works, because the
generator only advances when the next stage pulls.

## Exercise 1 — a Transform with a last word

Edit `ex1/solution.ts`. Implement `createUppercase()`, returning a `Transform`
that uppercases every chunk that passes through it and, when the input ends,
emits one final chunk: `[N chunks]`, where N is how many chunks it saw.

`createUppercase()` on an empty stream still emits `[0 chunks]` — the flush
runs whether or not anything arrived.

```
uv run dojo test node 07_streams_2 ex1
```

## Exercise 2 — pipeline, and the thing `.pipe()` does not do

Edit `ex2/solution.ts`. Implement:

```ts
pipeThrough(source, transforms, sink): Promise<void>
```

Wire the source, then every transform in order, then the sink, and resolve
when it is done — or reject with the error if any stage fails.

The gate then checks something `.pipe()` cannot give you: after a failure, the
**sink and the source must both be destroyed**. That is the difference between
a pipeline that fails and a pipeline that leaks. In a real program those two
streams are a socket and a file handle, and the version that leaves them open
is the one that runs out of file descriptors at 4am on a Sunday.

```
uv run dojo test node 07_streams_2 ex2
```

## Exercise 3 — bytes in, lines out

Edit `ex3/solution.ts`. Implement `createLineSplitter()`, a `Transform` whose
writable side takes bytes and whose readable side emits **one string per
line**, without the newline.

The rules:

- a line may be split across any number of chunks, and a chunk may hold many
  lines;
- a trailing `\r` (Windows line endings) is not part of the line;
- if the input does not end with a newline, the last partial line is still a
  line and must be emitted from `flush`;
- if the input *does* end with a newline, there is no empty extra line.

And one requirement inherited from lesson 06: the gate splits a two-byte `ü`
across two chunks. `chunk.toString()` per chunk corrupts it. Use
`node:string_decoder`'s `StringDecoder`, which holds an incomplete character
back until its remaining bytes arrive.

This is the most useful thirty lines in this course. Log processing, CSV,
NDJSON, SMTP, HTTP header parsing — they are all this function with a
different separator.

```
uv run dojo test node 07_streams_2 ex3
```

## Exercise 4 — a transform that is just a function

Edit `ex4/solution.ts`. Implement `withLineNumbers(source)` as an **async
generator** that takes an async iterable and yields `` `${n}: ${item}` `` for
each item, counting from 1.

The gate uses it twice: once by iterating it directly, and once by handing the
function itself to `pipeline` as a stage. Both work, because Node's pipeline
accepts async generator functions — which means most "I need a Transform" jobs
are really "I need a small generator".

```
uv run dojo test node 07_streams_2 ex4
```

## Challenge — CSV in, JSON lines out

Edit `challenge/solution.ts`. Implement:

```ts
processCsv(source, sink, { minAmount }): Promise<{ read, written }>
```

The source is a byte stream of CSV: a header row `id,amount`, then data rows.
For every data row whose `amount` is **at least** `minAmount`, write one line
to the sink:

```
{"id":"2","amount":250}
```

— `id` as a string, `amount` as a number, `\n` at the end of each line.
Return `{ read, written }`: data rows seen (excluding the header) and rows
written.

Build it as a `pipeline` of stages. Copy your ex3 splitter into this file
rather than importing it — the exercises are deliberately isolated so a bug in
one gate never fails another.

Honest difficulty note: every individual piece is something you have already
written. The work is in the seams — the header row, blank lines, a row split
across two chunks (the gate does this on purpose), and keeping the counters
somewhere both the transform and the return statement can see.

```
uv run dojo test node 07_streams_2 challenge
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule. Implement
`createJsonParser()`: a `Transform` whose writable side takes bytes — one JSON
document per chunk — and whose readable side emits the parsed objects. A chunk
that fails to parse must fail the stream through the transform callback, not
by throwing.

```
uv run dojo test node 07_streams_2 review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { Readable, Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { describe, expect, test } from "vitest";

import { createUppercase } from "./ex1/solution";
import { pipeThrough } from "./ex2/solution";
import { createLineSplitter } from "./ex3/solution";
import { withLineNumbers } from "./ex4/solution";
import { processCsv } from "./challenge/solution";
import { createJsonParser } from "./review1/solution";

/** A sink that keeps what it was given. Byte mode by default. */
function sink(objectMode = false): { stream: Writable; items: unknown[]; text(): string } {
  const items: unknown[] = [];
  const stream = new Writable({
    objectMode,
    write(chunk, _encoding, callback) {
      items.push(objectMode ? chunk : Buffer.from(chunk as Buffer));
      callback();
    },
  });
  return {
    stream,
    items,
    text: () => Buffer.concat(items as Buffer[]).toString("utf8"),
  };
}

describe("07_streams_2", () => {
  test("ex1 - createUppercase() transforms every chunk and has a last word", async () => {
    const out = sink();
    await pipeline(Readable.from(["ab", "cd", "ef"]), createUppercase(), out.stream);

    expect(
      out.text(),
      "each chunk is uppercased and passed on, and when the input ends the " +
        "transform emits one final chunk counting what it saw: [3 chunks]",
    ).toBe("ABCDEF[3 chunks]");

    const empty = sink();
    await pipeline(Readable.from([]), createUppercase(), empty.stream);
    expect(
      empty.text(),
      "an empty input still ends, and the flush still runs - [0 chunks]",
    ).toBe("[0 chunks]");
  });

  test("ex2 - pipeThrough() tears the whole chain down when one link fails", async () => {
    const good = sink();
    await pipeThrough(
      Readable.from(["one ", "two"]),
      [
        new Transform({
          transform(chunk, _encoding, callback) {
            callback(null, chunk);
          },
        }),
      ],
      good.stream,
    );
    expect(good.text(), "the happy path just moves the bytes through").toBe("one two");

    const doomed = sink();
    const source = Readable.from(["fine ", "poison ", "never"]);
    const failing = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        if (chunk.toString().includes("poison")) callback(new Error("bad row"));
        else callback(null, chunk);
      },
    });

    await expect(
      pipeThrough(source, [failing], doomed.stream),
      "a failing link must reject the promise you return, with its error",
    ).rejects.toThrow("bad row");

    expect(
      doomed.stream.destroyed,
      "and every other stream in the chain must be destroyed. This is the " +
        "whole reason pipeline() exists: .pipe() would leave this sink open " +
        "forever, holding its file handle or socket (README ex2)",
    ).toBe(true);
    expect(
      source.destroyed,
      "the source is torn down too, so it stops producing",
    ).toBe(true);
  });

  test("ex3 - createLineSplitter() puts the lines back together", async () => {
    const out = sink(true);
    await pipeline(
      Readable.from([
        "alpha\nbe",
        // "ü" is two bytes, split across the next two chunks on purpose.
        Buffer.from([0x74, 0x61, 0xc3]),
        Buffer.from([0xbc, 0x0a]),
        "gamma\r\n",
        "delta",
      ]),
      createLineSplitter(),
      out.stream,
    );

    expect(
      out.items,
      "one string per line, no newline characters, a trailing \\r stripped, " +
        "and the final line emitted even though the input never ended with a " +
        "newline. If betaü came out as beta plus two replacement characters, " +
        "you decoded a chunk that was only half a character (README ex3)",
    ).toEqual(["alpha", "betaü", "gamma", "delta"]);

    const trailing = sink(true);
    await pipeline(Readable.from(["a\nb\n"]), createLineSplitter(), trailing.stream);
    expect(
      trailing.items,
      "an input that ends with a newline has no empty last line",
    ).toEqual(["a", "b"]);
  });

  test("ex4 - withLineNumbers() is a transform written as an async generator", async () => {
    const numbered: string[] = [];
    for await (const line of withLineNumbers(Readable.from(["alpha", "beta"]))) {
      numbered.push(line);
    }
    expect(
      numbered,
      "each item comes back as `N: item`, counting from 1",
    ).toEqual(["1: alpha", "2: beta"]);

    const out = sink(true);
    await pipeline(Readable.from(["only"]), withLineNumbers, out.stream);
    expect(
      out.items,
      "an async generator can be dropped straight into pipeline() as a stage - " +
        "no Transform subclass required",
    ).toEqual(["1: only"]);
  });

  test("challenge - processCsv() filters a stream it never holds in memory", async () => {
    const out = sink();
    const stats = await processCsv(
      Readable.from([
        "id,amount\n1,10\n2,",   // a row split across two chunks
        "250\n3,7\n4,900\n",
      ]),
      out.stream,
      { minAmount: 100 },
    );

    expect(
      out.text(),
      "one JSON object per line, in input order, for the rows that pass the " +
        "filter - and a trailing newline on each so the output is valid JSONL",
    ).toBe('{"id":"2","amount":250}\n{"id":"4","amount":900}\n');
    expect(
      stats,
      "read counts the data rows (not the header); written counts the ones " +
        "that survived the filter",
    ).toEqual({ read: 4, written: 2 });
  });

  test("review1 - createJsonParser() turns text into objects, or fails loudly", async () => {
    const out = sink(true);
    await pipeline(
      Readable.from(['{"id":1}', '{"id":2}']),
      createJsonParser(),
      out.stream,
    );
    expect(
      out.items,
      "each chunk is one JSON document; the transform emits the parsed object",
    ).toEqual([{ id: 1 }, { id: 2 }]);

    const doomed = sink(true);
    await expect(
      pipeline(Readable.from(['{"id":1}', "{ oops"]), createJsonParser(), doomed.stream),
      "a chunk that will not parse must fail the stream by calling the " +
        "transform callback with an error - never throw out of transform(), " +
        "and never swallow it",
    ).rejects.toThrow();
    expect(
      doomed.items,
      "the documents that parsed before the failure still got through",
    ).toEqual([{ id: 1 }]);
  });
});
```

In plain English:

- `sink()` is the gate's collector — the same shape you wrote in lesson 06
  ex4, with an object-mode switch so it can accept either bytes or values.
- **ex1** pipes three chunks through and compares the whole output including
  the flush, then repeats with an empty source.
- **ex2** runs a passthrough for the happy path, then a transform that fails on
  a poisoned chunk, and checks the rejection *and* `destroyed` on both ends of
  the chain.
- **ex3** feeds a deliberately hostile sequence: a line split across chunks, a
  character split across chunks, a Windows line ending, and no trailing
  newline. Then a second, simpler input that ends with a newline, to check you
  did not invent an empty last line.
- **ex4** iterates your generator directly and then uses it as a pipeline
  stage, which are two different code paths in Node.
- **challenge** splits a data row across two chunks, so a per-chunk parser
  produces `2,` and `250` as separate rows and fails loudly.
- **review1** parses two documents, then feeds a broken one and requires the
  pipeline to reject — while the object that parsed *before* the failure has
  still reached the sink.

## The teaching point

A pipeline is a program written as a list of stages, and its memory footprint
is the sum of the buffers between them — not the size of the data. That is the
whole reason to work this way. The same `processCsv` you just wrote handles a
20-row file and a 20-gigabyte file with the same heap.

Two rules to carry out of here. **Use `pipeline`, never `.pipe()`**, because
error propagation and cleanup are not optional in anything that runs
unattended. And **make each stage do one thing** — split, parse, filter,
format — because that is what makes them testable in isolation and reusable in
the next pipeline. The stages you wrote today (a line splitter, a JSON parser,
a filter) are the same four you will assemble differently for the rest of your
career.

Next: **08_http_core**, where the stream is a socket, the source is a browser,
and you write the server by hand before anyone lets you near express.
