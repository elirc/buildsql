# 06 — Buffers and streams

Up to now every value you have handled fitted in memory and arrived all at
once. That is a comfortable assumption and it is wrong for most of what
servers actually do. A 4 GB video upload does not fit in memory. A log file
being tailed has no end. A response to a client is not a string you produce
and then hand over; it is bytes you write, at whatever rate the network will
take them.

Node's answer is two abstractions that predate almost everything else in the
platform. A **Buffer** is a fixed-length chunk of raw bytes outside the
JavaScript heap — the thing you get when you read from a socket or a file
without asking for a decoded string. A **stream** is a sequence of those
chunks over time, with a protocol for pushing back when the consumer cannot
keep up.

That last part — backpressure — is the reason streams exist rather than just
"read it all, then process it". Without it, a fast source and a slow sink mean
an ever-growing buffer in the middle, and the only thing that stops it growing
is the process dying. With it, the fast source is told to wait. Every
`.pipe()` you have ever written implements this for you; this lesson makes you
write it by hand once so you know what it is doing.

## Concept — bytes first, then chunks over time

A `Buffer` is a `Uint8Array` with extra methods, and the important thing about
it is what it is *not*: a string.

```ts
const buf = Buffer.from("café", "utf8");
buf.length;                     // 5   <- BYTES, not characters
"café".length;                  // 4   <- characters (UTF-16 code units)
Buffer.byteLength("café");      // 5   <- ask this before you allocate

Buffer.alloc(4);                // 4 zeroed bytes
buf.readUInt16BE(0);            // read a 16-bit big-endian number
buf.subarray(1, 3);             // a VIEW of the same memory, not a copy
Buffer.concat([a, b]);          // a new Buffer holding both
buf.toString("utf8");           // decode - the last step, not the first
buf.toString("hex");            // "636166c3a9"
buf.toString("base64");         // "Y2Fmw6k="
```

Two facts to file away. `Buffer.alloc(n)` zeroes the memory;
`Buffer.allocUnsafe(n)` does not, which is faster and hands you whatever was
in that memory before — a genuine information-disclosure bug if you forget to
overwrite all of it. And `subarray` shares memory with the original, so
writing through the view changes the source; `Buffer.from(view)` copies.

A **stream** is an `EventEmitter` with a state machine. There are four kinds:

| kind | direction | example |
|---|---|---|
| `Readable` | source | `fs.createReadStream`, an HTTP request on the server |
| `Writable` | sink | `fs.createWriteStream`, an HTTP response |
| `Duplex` | both, independently | a TCP socket |
| `Transform` | a Duplex where output derives from input | gzip, a parser (lesson 07) |

Consuming a readable stream, in the modern style:

```ts
for await (const chunk of readable) {
  // chunk is a Buffer, unless the stream is in object mode
}
```

Producing one, with the constructor:

```ts
const source = new Readable({
  read() {
    this.push("some data");   // hand a chunk to the consumer
    this.push(null);          // ...and that was the last one
  },
});
```

Consuming into a sink, and the protocol that matters:

```ts
const ok = writable.write(chunk);   // false = the buffer is over its limit
if (!ok) await once(writable, "drain");   // wait for the sink to catch up
```

`write()` never refuses a chunk — it always accepts it and buffers it. The
boolean is *advice*, and ignoring it is the difference between a program with
bounded memory and one that queues an entire file in RAM. The threshold it
compares against is `highWaterMark`, 64 KB by default for byte streams.

One more thing, because it is the trap the exercises are built around:
**never decode a chunk on its own.** UTF-8 is variable-length, a chunk
boundary can fall in the middle of a character, and decoding each half
produces two replacement characters and permanent corruption. Collect
`Buffer`s, concatenate, decode once — or use `StringDecoder`, which holds
partial characters back until the rest arrives.

## Exercise 1 — read and write a binary frame

Edit `ex1/solution.ts`. A "frame" in this lesson is:

```
byte 0     version (uint8)
bytes 1-2  payload length in BYTES (uint16, big-endian)
bytes 3+   the payload, UTF-8
```

Implement `encodeFrame({ version, payload })` → `Buffer`, and
`decodeFrame(buffer)` → `{ version, payload }`.

The gate encodes `"café"`, which is four characters and five bytes — if your
length field says 4, you have measured the wrong thing. It also appends junk
after a valid frame and expects `decodeFrame` to ignore it: a parser trusts
its header, not the end of the buffer it happens to be holding.

```
uv run dojo test node 06_buffers_streams ex1
```

## Exercise 2 — collect a stream without corrupting it

Edit `ex2/solution.ts`. Implement `collect(readable)`, resolving to a single
`Buffer` holding everything the stream produced.

The gate feeds you `"café"` split so that the two bytes of `é` land in
different chunks. Decode-then-join fails; join-then-decode passes. An empty
stream must give you an empty `Buffer`.

```
uv run dojo test node 06_buffers_streams ex2
```

## Exercise 3 — build a source

Edit `ex3/solution.ts`. Implement `createCounter(limit)`, returning a
`Readable` that emits `"1"`, `"2"`, … up to `limit` and then ends.
`createCounter(0)` emits nothing and still ends.

Two things to get right: `this.push(value)` inside `read()` delivers a chunk,
and `this.push(null)` is the only way to say "there are no more". A stream
that never pushes `null` is a `for await` that never returns — if the gate
hangs for five seconds and then fails, that is what happened.

```
uv run dojo test node 06_buffers_streams ex3
```

## Exercise 4 — build a sink

Edit `ex4/solution.ts`. Implement `createCollector()`, returning
`{ writable, text() }` where `writable` is a `Writable` that keeps every chunk
written to it, and `text()` decodes all of them as UTF-8.

The rule that catches everyone once: your `write(chunk, encoding, callback)`
implementation **must call `callback()`**. That is how a writable stream says
"send me the next one". Forget it and the pipeline stalls after exactly one
chunk, with no error and no clue.

```
uv run dojo test node 06_buffers_streams ex4
```

## Challenge — backpressure, by hand

Edit `challenge/solution.ts`. Implement `writeAll(writable, chunks)`: write
every chunk in order, and whenever `write()` returns `false`, wait for the
stream's `"drain"` event before continuing. Do not call `end()` — the caller
owns the stream.

The gate builds a deliberately slow sink with a 16-byte `highWaterMark` and
records how much data was sitting in its buffer at the worst moment. Write
without checking and that number is ten times the limit; write properly and it
stays at the limit. That number is memory — in a real upload it is the
difference between a constant 64 KB and the whole file.

Honest difficulty note: the code is six lines. Understanding *why* it is six
lines and what each one prevents takes longer, and it is the point.

```
uv run dojo test node 06_buffers_streams challenge
```

## Review

`review1/solution.ts` comes back on the spaced-review schedule. Implement
`readFrames(buffer)`: the same frame format as ex1, but the buffer holds
several frames end to end. Return them all, in order. An empty buffer gives an
empty array, and a frame with an empty payload is still a frame.

```
uv run dojo test node 06_buffers_streams review1
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
import { Readable, Writable } from "node:stream";
import { describe, expect, test } from "vitest";

import { decodeFrame, encodeFrame } from "./ex1/solution";
import { collect } from "./ex2/solution";
import { createCounter } from "./ex3/solution";
import { createCollector } from "./ex4/solution";
import { writeAll } from "./challenge/solution";
import { readFrames } from "./review1/solution";

describe("06_buffers_streams", () => {
  test("ex1 - encodeFrame()/decodeFrame() speak bytes, not characters", () => {
    const frame = encodeFrame({ version: 2, payload: "café" });

    expect(Buffer.isBuffer(frame), "encodeFrame() returns a Buffer").toBe(true);
    expect(
      frame.length,
      "1 byte of version + 2 bytes of length + the payload. \"café\" is four " +
        "characters but FIVE bytes in UTF-8, so the frame is 8 bytes long - " +
        "Buffer.byteLength is the function that knows the difference",
    ).toBe(8);
    expect(frame[0], "byte 0 is the version").toBe(2);
    expect(
      frame.readUInt16BE(1),
      "bytes 1-2 are the payload length in BYTES, big-endian: the high byte " +
        "first, which is network byte order",
    ).toBe(5);
    expect(
      frame.subarray(3).toString("utf8"),
      "the payload follows, encoded as UTF-8",
    ).toBe("café");

    expect(
      decodeFrame(frame),
      "decodeFrame() is the exact inverse: read the header, then slice the " +
        "payload out by the length the header claims",
    ).toEqual({ version: 2, payload: "café" });

    const withTrailer = Buffer.concat([frame, Buffer.from("ignore me")]);
    expect(
      decodeFrame(withTrailer),
      "anything after the declared length is the NEXT frame, not part of this " +
        "one - trust the header, not the end of the buffer",
    ).toEqual({ version: 2, payload: "café" });
  });

  test("ex2 - collect() concatenates bytes, never strings", async () => {
    // "café" = 63 61 66 c3 a9, split so that the two bytes of é land in
    // different chunks - exactly what a socket does to you.
    const source = Readable.from([
      Buffer.from([0x63, 0x61, 0x66, 0xc3]),
      Buffer.from([0xa9]),
    ]);

    const collected = await collect(source);
    expect(Buffer.isBuffer(collected), "collect() resolves to one Buffer").toBe(true);
    expect(
      collected.toString("utf8"),
      "decoding each chunk separately and joining the strings gives you two " +
        "replacement characters here, because the é is split across the chunk " +
        "boundary. Concatenate the BYTES and decode once (README ex2)",
    ).toBe("café");

    expect(
      (await collect(Readable.from([]))).length,
      "an empty stream collects to an empty Buffer, not undefined",
    ).toBe(0);
  });

  test("ex3 - createCounter() is a readable source with an end", async () => {
    const counter = createCounter(3);
    expect(counter instanceof Readable, "createCounter() returns a Readable").toBe(true);

    const chunks: Buffer[] = [];
    for await (const chunk of counter) {
      chunks.push(chunk as Buffer);
    }

    expect(
      chunks.map((chunk) => chunk.toString()),
      "three chunks, in order, one per number",
    ).toEqual(["1", "2", "3"]);
    expect(
      Buffer.isBuffer(chunks[0]),
      "a stream that is not in object mode converts the strings you push into " +
        "Buffers on the way out - that is what makes it a byte stream",
    ).toBe(true);

    const empty: unknown[] = [];
    for await (const chunk of createCounter(0)) empty.push(chunk);
    expect(
      empty,
      "counting to zero produces no chunks and still ends cleanly - if this " +
        "hangs, you never signalled the end of the stream",
    ).toEqual([]);
  });

  test("ex4 - createCollector() is a writable sink that remembers", async () => {
    const collector = createCollector();
    expect(
      collector.writable instanceof Writable,
      "createCollector() hands back a real Writable",
    ).toBe(true);

    await new Promise<void>((resolve, reject) => {
      Readable.from(["hello ", "streaming ", "world"])
        .pipe(collector.writable)
        .on("finish", resolve)
        .on("error", reject);
    });

    expect(
      collector.text(),
      "every chunk written, in order, decoded once at the end",
    ).toBe("hello streaming world");
  });

  test("challenge - writeAll() waits for drain instead of flooding the buffer", async () => {
    const received: Buffer[] = [];
    let maxBuffered = 0;

    const slow: Writable = new Writable({
      highWaterMark: 16,
      write(chunk: Buffer, _encoding, callback) {
        received.push(Buffer.from(chunk));
        maxBuffered = Math.max(maxBuffered, slow.writableLength);
        // A sink that cannot keep up: every chunk costs a turn of the loop.
        setImmediate(callback);
      },
    });

    const chunks = Array.from({ length: 20 }, (_, i) =>
      Buffer.from(String(i % 10).repeat(8)),
    );
    await writeAll(slow, chunks);
    await new Promise<void>((resolve) => slow.end(() => resolve()));

    expect(
      Buffer.concat(received).toString(),
      "every chunk must arrive, in order",
    ).toBe(Buffer.concat(chunks).toString());
    expect(
      maxBuffered,
      "the sink asked you to slow down (write() returned false) and you have " +
        "to listen. If this number is far above the 16-byte highWaterMark, " +
        "you kept writing and the stream buffered everything in memory - which " +
        "is how a 2GB file upload becomes a 2GB heap (README challenge)",
    ).toBeLessThanOrEqual(16);
  });

  test("review1 - readFrames() walks a buffer holding several frames", () => {
    const buffer = Buffer.concat([
      encodeFrameLocally(1, "one"),
      encodeFrameLocally(2, "twø"),
      encodeFrameLocally(3, ""),
    ]);

    expect(
      readFrames(buffer),
      "read the header, take that many bytes, move the cursor past them, and " +
        "start again - until the buffer runs out. The empty payload is a frame " +
        "too, not a stopping condition",
    ).toEqual([
      { version: 1, payload: "one" },
      { version: 2, payload: "twø" },
      { version: 3, payload: "" },
    ]);

    expect(readFrames(Buffer.alloc(0)), "no bytes, no frames").toEqual([]);
  });
});

/** The gate builds its own frames so review1 does not depend on your ex1. */
function encodeFrameLocally(version: number, payload: string): Buffer {
  const body = Buffer.from(payload, "utf8");
  const header = Buffer.alloc(3);
  header.writeUInt8(version, 0);
  header.writeUInt16BE(body.length, 1);
  return Buffer.concat([header, body]);
}
```

In plain English:

- **ex1** checks the frame byte by byte — total length, version, the
  big-endian length field, the payload — then round-trips it, then adds a
  trailing junk buffer that a length-respecting parser ignores.
- **ex2** builds the split-character stream by hand with raw byte values, so
  the failure mode is unmistakable: you get `caf` followed by two replacement
  characters.
- **ex3** consumes your stream with `for await`, checks the values and the
  chunk type, then runs the zero case, which is where a missing `push(null)`
  shows up.
- **ex4** pipes a readable into your writable and waits for `"finish"`, which
  only fires if every `callback()` was called.
- **challenge** records `writable.writableLength` inside the sink's `_write`,
  which is exactly how much data is queued at that moment. The assertion is
  about memory, not about time.
- **review1** builds three frames with the gate's *own* encoder — so a bug in
  your ex1 cannot fail your review1 — including one with an empty payload.

## The teaching point

The reason streams are worth the trouble is a single number: memory that does
not depend on input size. `readFile` then `JSON.parse` on a 2 GB file needs
2 GB (twice, briefly); a streaming parser needs a chunk at a time. That is the
difference between a service that handles a big upload and one that gets
OOM-killed by it, and it is why the answer to "how would you process a file
too large to fit in memory" is always "stream it".

The second reason is time to first byte. A stream can start producing output
before it has finished reading input — which is why a proxy can begin
forwarding a response before the upstream has finished sending it, and why a
CSV export can start downloading before the query has finished.

The habit to keep: **when data has a size you do not control, do not hold all
of it.** Read it as chunks, write it as chunks, and respect the one boolean
that tells you to slow down.

Next: **07_streams_2**, where you put a `Transform` in the middle and let
`pipeline()` wire the errors up for you.
