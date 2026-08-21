// Gate for node/06_buffers_streams. Quoted verbatim in README.md.
//
// Everything here is in memory: Readable.from() for sources, a Writable with
// a tiny highWaterMark for the backpressure test. No sockets, no files, no
// timing assumptions.
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
