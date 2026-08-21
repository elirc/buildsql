// Gate for node/07_streams_2. Quoted verbatim in README.md.
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
