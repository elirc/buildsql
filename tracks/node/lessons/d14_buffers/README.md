# d14 — Buffers

Eight problems on `Buffer`, drawn from lesson **06_buffers_streams** — the half
of it that never touches a stream. Lesson 06 taught you to encode a frame and to
concatenate bytes rather than strings; this set drills the family that lives
around that skill: encodings with names, numbers whose width you choose, fixed
layouts, and text that arrives in the wrong places.

One rule runs through all eight. A `Buffer` is a sequence of **bytes**, and a
string is a sequence of **characters**; the conversion between them is lossy in
one direction and expensive in the other, so you do it exactly once, at a
boundary you chose. Every trap in this set is a solution that reached for
`toString()` a step too early.

## Problem 1 — the encoding that survives a URL

Edit `ex1/solution.ts`. `toBase64Url(buffer)` encodes with the url-safe alphabet
(`-` and `_` instead of `+` and `/`) and no `=` padding.
`fromBase64Url(text)` is the inverse, and also accepts an ordinary padded
base64 string, because half the tokens in the world are encoded by somebody else.

```
uv run dojo test node d14_buffers ex1
```

## Problem 2 — a number that costs what it is worth

Edit `ex2/solution.ts`. `writeVarInt(value)` encodes an unsigned LEB128 varint:
seven bits of number per byte, least significant group first, top bit set while
more bytes follow. `readVarInt(buffer, offset)` reads one starting at `offset`
and returns `{ value, bytesRead }`.

```
uv run dojo test node d14_buffers ex2
```

## Problem 3 — a fixed layout, read field by field

Edit `ex3/solution.ts`. `parseRecordHeader(buffer)` reads a 19-byte header —
magic `"DOJO"` (4 bytes) | `flags` uint8 | `count` uint32 **LE** | `id` uint16
**BE** | `name`, 8 bytes of ASCII padded with NUL — and returns
`{ flags, count, id, name }` with the padding stripped. A buffer too short, or
with the wrong magic, throws a message that says which.

```
uv run dojo test node d14_buffers ex3
```

## Problem 4 — split, without ever decoding

Edit `ex4/solution.ts`. `splitBuffer(buffer, delimiter)` cuts at every
occurrence of a multi-byte `delimiter` and returns **Buffers**. Empty pieces are
kept, including at either end, and a delimiter that never occurs yields one
piece: the whole input.

```
uv run dojo test node d14_buffers ex4
```

## Problem 5 — the half character at the end of the chunk

Edit `ex5/solution.ts`. `createUtf8Decoder()` returns `{ push, end }`.
`push(chunk)` returns the complete characters that chunk finished and **holds**
any partial one; `end()` returns whatever is left when no more bytes are coming.

```
uv run dojo test node d14_buffers ex5
```

## Problem 6 — a whole file inlined in a string

Edit `ex6/solution.ts`. `parseDataUrl(text)` returns `{ mediaType, data }` for a
`data:` URL, or `null`. The payload is base64 when the metadata ends `;base64`
and percent-encoded otherwise; an omitted media type is
`text/plain;charset=US-ASCII`, and `data` is always a Buffer.

```
uv run dojo test node d14_buffers ex6
```

## Problem 7 — frames out of chunks that do not line up

Edit `ex7/solution.ts`. `createFrameReader()` returns `{ push, pending }` for a
stream of `uint32BE length` + payload. `push(chunk)` returns every whole frame
that chunk completed — none, one, or several — and keeps the leftover bytes;
`pending()` reports how many are held. Chunks split anywhere, including inside a
length prefix.

```
uv run dojo test node d14_buffers ex7
```

## Problem 8 — where the text ends and the bytes begin

Edit `ex8/solution.ts`. `splitHeadersAndBody(buffer)` splits at the **first**
`CRLF CRLF`. The head is CRLF-separated `Name: value` lines: names lower-cased,
values trimmed, a repeated header joined with `", "`, and only the first colon
on a line is a separator. The body stays raw bytes. No terminator, or a line
with no colon, throws a message naming the problem.

```
uv run dojo test node d14_buffers ex8
```

## The gate

This is the entire gate, `gate.test.ts`:

```ts
// Gate for node/d14_buffers. Quoted verbatim in README.md.
//
// Everything here is bytes. The gate builds every fixture from explicit byte
// values or from its own local encoders - never from another exercise - and
// compares Buffers against Buffers, so a solution that goes through a string
// on the way is caught rather than tolerated.
import { describe, expect, test } from "vitest";

import { fromBase64Url, toBase64Url } from "./ex1/solution";
import { readVarInt, writeVarInt } from "./ex2/solution";
import { parseRecordHeader } from "./ex3/solution";
import { splitBuffer } from "./ex4/solution";
import { createUtf8Decoder } from "./ex5/solution";
import { parseDataUrl } from "./ex6/solution";
import { createFrameReader } from "./ex7/solution";
import { splitHeadersAndBody } from "./ex8/solution";

/** The gate encodes its own varints so ex2 never grades ex2 against itself. */
function varIntLocally(value: number): Buffer {
  const bytes: number[] = [];
  let rest = value;
  do {
    const seven = rest & 0x7f;
    rest = Math.floor(rest / 128);
    bytes.push(rest > 0 ? seven | 0x80 : seven);
  } while (rest > 0);
  return Buffer.from(bytes);
}

/** The 19-byte record header of ex3, built by hand. */
function headerLocally(options: {
  magic?: string;
  flags: number;
  count: number;
  id: number;
  name: string;
}): Buffer {
  const buffer = Buffer.alloc(19);
  buffer.write(options.magic ?? "DOJO", 0, 4, "ascii");
  buffer.writeUInt8(options.flags, 4);
  buffer.writeUInt32LE(options.count, 5);
  buffer.writeUInt16BE(options.id, 9);
  buffer.write(options.name, 11, 8, "ascii");
  return buffer;
}

/** The length-prefixed frame of ex7, built by hand. */
function frameLocally(payload: string): Buffer {
  const body = Buffer.from(payload, "utf8");
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);
  return Buffer.concat([header, body]);
}

describe("d14_buffers", () => {
  test("ex1 - the base64url pair survives the characters a URL cannot carry", () => {
    expect(
      toBase64Url(Buffer.from("hello world", "utf8")),
      "base64url has no padding at all: aGVsbG8gd29ybGQ= is the ordinary " +
        "encoding, and the = is what breaks when the value goes in a path " +
        "segment or a filename",
    ).toBe("aGVsbG8gd29ybGQ");

    // These three bytes are chosen so that ordinary base64 produces "+//+".
    const awkward = Buffer.from([0xfb, 0xff, 0xfe]);
    expect(
      awkward.toString("base64"),
      "sanity check on the fixture: ordinary base64 really does produce a plus " +
        "and two slashes here",
    ).toBe("+//+");
    expect(
      toBase64Url(awkward),
      "and the url-safe alphabet swaps + for - and / for _. A slash inside a " +
        "path segment is a new path segment, which is how a token turns into a " +
        "404",
    ).toBe("-__-");

    expect(
      fromBase64Url("aGVsbG8gd29ybGQ").toString("utf8"),
      "decoding is the exact inverse, missing padding and all",
    ).toBe("hello world");
    expect(
      Buffer.isBuffer(fromBase64Url("aGVsbG8")),
      "fromBase64Url() hands back a Buffer, not a string - what was encoded " +
        "may not have been text",
    ).toBe(true);

    expect(
      [...fromBase64Url("+//+")],
      "be liberal in what you accept: an ordinary base64 string, padding and " +
        "all, still has to decode. Half the tokens in the world are encoded by " +
        "somebody else",
    ).toEqual([0xfb, 0xff, 0xfe]);

    const roundTrip = Buffer.from([0x00, 0x10, 0xff, 0x80, 0x7f]);
    expect(
      [...fromBase64Url(toBase64Url(roundTrip))],
      "and any bytes at all go out and come back unchanged",
    ).toEqual([...roundTrip]);

    expect(toBase64Url(Buffer.alloc(0)), "no bytes encode to no characters").toBe("");
  });

  test("ex2 - the varint spends one byte on small numbers and grows as it must", () => {
    expect([...writeVarInt(0)], "zero is one byte, and that byte is zero").toEqual([0x00]);
    expect(
      [...writeVarInt(127)],
      "127 is the largest number that fits in seven bits, so it is still one " +
        "byte and the continuation bit stays clear",
    ).toEqual([0x7f]);
    expect(
      [...writeVarInt(128)],
      "128 needs a second byte: the low seven bits first with the top bit SET " +
        "to say more is coming, then the rest. Little end first is not a typo - " +
        "it is what makes the format streamable",
    ).toEqual([0x80, 0x01]);
    expect([...writeVarInt(300)], "300 is 0xac 0x02 in every LEB128 test vector").toEqual([
      0xac, 0x02,
    ]);
    expect([...writeVarInt(16_384)], "and 2^14 takes three bytes").toEqual([0x80, 0x80, 0x01]);

    expect(
      readVarInt(varIntLocally(0), 0),
      "reading reports the value AND how many bytes it consumed - a caller " +
        "that cannot advance its cursor cannot read the next field",
    ).toEqual({ value: 0, bytesRead: 1 });
    expect(readVarInt(varIntLocally(300), 0), "the same vector, decoded").toEqual({
      value: 300,
      bytesRead: 2,
    });
    expect(readVarInt(varIntLocally(1_000_000), 0), "and a bigger one").toEqual({
      value: 1_000_000,
      bytesRead: 3,
    });

    const embedded = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      varIntLocally(300),
      Buffer.from("tail", "utf8"),
    ]);
    expect(
      readVarInt(embedded, 2),
      "a varint is almost never alone: read from the offset you were given and " +
        "stop at the first byte whose top bit is clear. Reading to the end of " +
        "the buffer swallows the payload behind it",
    ).toEqual({ value: 300, bytesRead: 2 });

    expect(
      () => readVarInt(Buffer.from([0x80, 0x80]), 0),
      "a varint whose last byte still says more is coming is truncated, and " +
        "saying so beats returning a number that is quietly wrong",
    ).toThrow(/truncated|incomplete|unterminated/i);
  });

  test("ex3 - parseRecordHeader() reads each field in the width and order it was written", () => {
    const header = headerLocally({ flags: 0x03, count: 70_000, id: 513, name: "ledger" });

    const parsed = parseRecordHeader(header);
    expect(parsed.flags, "one byte, no endianness to get wrong").toBe(0x03);
    expect(
      parsed.count,
      "count is uint32 LITTLE endian. Reading it big-endian gives 1880096512, " +
        "which is a plausible-looking number and completely wrong - the layout " +
        "tells you the width and the order, and both matter",
    ).toBe(70_000);
    expect(
      parsed.id,
      "id is uint16 BIG endian, in the same header as a little-endian field. " +
        "Mixed layouts are common in real formats and readUInt16LE gives 258 here",
    ).toBe(513);
    expect(
      parsed.name,
      "the name is a fixed 8-byte field padded with NUL bytes, and the padding " +
        "is not part of the name. Leaving it on gives you a string that prints " +
        "correctly and compares unequal to everything",
    ).toBe("ledger");

    expect(
      parseRecordHeader(headerLocally({ flags: 0, count: 0, id: 0, name: "register" })).name,
      "a name that exactly fills the field has no padding to strip",
    ).toBe("register");

    const withPayload = Buffer.concat([header, Buffer.from("payload bytes", "utf8")]);
    expect(
      parseRecordHeader(withPayload).count,
      "a header is the FRONT of a buffer, not the whole of it - anything after " +
        "byte 19 belongs to whoever asked",
    ).toBe(70_000);

    expect(
      () => parseRecordHeader(header.subarray(0, 12)),
      "a buffer too short to hold the header must say so. Without the check, " +
        "readUInt32LE throws an ERR_OUT_OF_RANGE that names an offset and " +
        "explains nothing",
    ).toThrow(/19 bytes/);

    expect(
      () => parseRecordHeader(headerLocally({ magic: "NOPE", flags: 0, count: 1, id: 1, name: "x" })),
      "and the magic exists to be checked - four bytes that say you are " +
        "looking at the right kind of file before you trust the rest",
    ).toThrow(/magic/i);
  });

  test("ex4 - splitBuffer() cuts bytes, and never looks at characters", () => {
    const crlf = Buffer.from("\r\n", "ascii");

    const pieces = splitBuffer(Buffer.from("a\r\nbb\r\n\r\nc", "utf8"), crlf);
    expect(
      pieces.map((piece) => piece.toString("utf8")),
      "four pieces: the empty one between the two adjacent delimiters is a " +
        "piece too. Dropping it is how a blank line stops ending a header block",
    ).toEqual(["a", "bb", "", "c"]);
    expect(
      Buffer.isBuffer(pieces[0]),
      "every piece is a Buffer. Returning strings here decodes data that may " +
        "not be text at all",
    ).toBe(true);

    expect(
      splitBuffer(Buffer.from("\r\nx\r\n", "utf8"), crlf).map((piece) => piece.length),
      "a delimiter at the start and at the end produces an empty piece at each " +
        "end - three pieces, not one",
    ).toEqual([0, 1, 0]);

    // 0xa9 is the SECOND byte of the two-byte UTF-8 encoding of e-acute.
    const accented = Buffer.from("héllo", "utf8");
    const halves = splitBuffer(accented, Buffer.from([0xa9]));
    expect(
      halves.length,
      "the delimiter is one byte from the middle of a character. A byte " +
        "operation finds it; converting to a string first cannot, because by " +
        "then the two bytes are one character",
    ).toBe(2);
    expect(
      [...halves[0]],
      "and the first piece ends on half a character, which is exactly what a " +
        "byte split does. If this came back as 0x68 0xef 0xbf 0xbd you " +
        "round-tripped through a string and lost the original bytes",
    ).toEqual([0x68, 0xc3]);

    const whole = Buffer.from("no delimiter here", "utf8");
    const single = splitBuffer(whole, Buffer.from("|", "ascii"));
    expect(single.length, "a delimiter that never occurs yields one piece").toBe(1);
    expect(
      single[0].toString("utf8"),
      "...and that piece is the whole input",
    ).toBe("no delimiter here");

    expect(
      splitBuffer(Buffer.alloc(0), crlf).map((piece) => piece.length),
      "an empty buffer is one empty piece, not zero pieces",
    ).toEqual([0]);
  });

  test("ex5 - the decoder holds back the half character instead of ruining it", () => {
    const decoder = createUtf8Decoder();

    // "café" is 63 61 66 c3 a9: the accented character is two bytes.
    expect(
      decoder.push(Buffer.from([0x63, 0x61, 0x66, 0xc3])),
      "the lead byte of a two-byte character arrived without its partner, so " +
        "only the three complete characters come out. Decoding this chunk on " +
        "its own gives you caf plus a replacement character, and the é is gone " +
        "for good",
    ).toBe("caf");
    expect(
      decoder.push(Buffer.from([0xa9])),
      "the held byte and the new one together are one character",
    ).toBe("é");
    expect(decoder.end(), "nothing is left over").toBe("");

    const wide = createUtf8Decoder();
    // A four-byte character, split three ways.
    expect(wide.push(Buffer.from([0xf0, 0x9f])), "two of four bytes: nothing yet").toBe("");
    expect(wide.push(Buffer.from([0x90])), "three of four: still nothing").toBe("");
    expect(
      wide.push(Buffer.from([0x9f])),
      "and the fourth byte completes it. A four-byte character can be split " +
        "three times, which is why hand-rolled two-byte handling is not enough",
    ).toBe("\u{1F41F}");

    const truncated = createUtf8Decoder();
    expect(truncated.push(Buffer.from([0x61, 0xc3])), "the a comes out, the c3 waits").toBe("a");
    expect(
      truncated.end(),
      "at the end of the stream a held byte can never be completed, so it is " +
        "reported as the replacement character rather than silently dropped",
    ).toBe("�");

    const empty = createUtf8Decoder();
    expect(empty.push(Buffer.alloc(0)), "an empty chunk decodes to nothing").toBe("");
    expect(empty.end(), "and a decoder that saw nothing ends with nothing").toBe("");
  });

  test("ex6 - parseDataUrl() knows which half of the comma it is reading", () => {
    const base64 = parseDataUrl("data:text/plain;base64,aGVsbG8=");
    expect(base64?.mediaType, "the media type is everything before the base64 marker").toBe(
      "text/plain",
    );
    expect(
      base64?.data.toString("utf8"),
      "and the payload is decoded from base64 into BYTES - the marker is a " +
        "statement about the encoding, not part of the type",
    ).toBe("hello");
    expect(Buffer.isBuffer(base64?.data), "data is a Buffer whatever it holds").toBe(true);

    const percent = parseDataUrl("data:text/plain,caf%C3%A9");
    expect(
      [...(percent?.data ?? Buffer.alloc(0))],
      "without the base64 marker the payload is percent-encoded, and %C3%A9 is " +
        "two bytes rather than two characters",
    ).toEqual([0x63, 0x61, 0x66, 0xc3, 0xa9]);

    const bare = parseDataUrl("data:,hello%20world");
    expect(
      bare?.mediaType,
      "an omitted media type defaults to text/plain;charset=US-ASCII - the " +
        "spec picks a default so that clients do not have to guess",
    ).toBe("text/plain;charset=US-ASCII");
    expect(bare?.data.toString("utf8"), "and %20 is a space").toBe("hello world");

    const json = parseDataUrl("data:application/json,%7B%22a%22%3A1%7D");
    expect(json?.mediaType, "any media type at all").toBe("application/json");
    expect(json?.data.toString("utf8"), "with its payload decoded").toBe('{"a":1}');

    const emptyPayload = parseDataUrl("data:image/png;base64,");
    expect(
      emptyPayload?.data.length,
      "an empty payload is a data url with no bytes in it, not a failure",
    ).toBe(0);

    expect(parseDataUrl("https://example.com/logo.png"), "an http url is not a data url").toBeNull();
    expect(
      parseDataUrl("data:text/plain;base64"),
      "and a data url with no comma has no payload boundary, so there is " +
        "nothing to parse",
    ).toBeNull();
  });

  test("ex7 - createFrameReader() reassembles frames from chunks that split anywhere", () => {
    const reader = createFrameReader();

    const two = Buffer.concat([frameLocally("first"), frameLocally("second")]);
    expect(
      reader.push(two).map((frame) => frame.toString("utf8")),
      "one chunk can carry several whole frames, and all of them come out of " +
        "one push",
    ).toEqual(["first", "second"]);
    expect(reader.pending(), "with nothing held back").toBe(0);

    const third = frameLocally("third");
    expect(
      reader.push(third.subarray(0, 2)),
      "two bytes is not even a length prefix yet, so there is nothing to " +
        "report. Reading a uint32 out of a two-byte buffer throws, which is why " +
        "the length check comes first",
    ).toEqual([]);
    expect(reader.pending(), "and those two bytes are being held").toBe(2);

    expect(
      reader.push(third.subarray(2, 6)),
      "the header is complete now but the payload is not, so still nothing",
    ).toEqual([]);
    expect(
      reader.push(third.subarray(6)),
      "and the rest of the payload finishes the frame",
    ).toEqual([Buffer.from("third", "utf8")]);
    expect(reader.pending(), "nothing left").toBe(0);

    const fourth = frameLocally("fourth");
    const fifth = frameLocally("fifth");
    const spanning = Buffer.concat([fourth.subarray(0, 5), Buffer.alloc(0)]);
    reader.push(spanning);
    const mixed = Buffer.concat([fourth.subarray(5), fifth, Buffer.from([0x00, 0x00])]);
    expect(
      reader.push(mixed).map((frame) => frame.toString("utf8")),
      "the tail of one frame, a whole frame, and the start of a third all " +
        "arrive in the same chunk - a reader that handles one frame per push " +
        "loses the rest",
    ).toEqual(["fourth", "fifth"]);
    expect(
      reader.pending(),
      "and the two leftover bytes are kept for next time rather than dropped",
    ).toBe(2);

    const zero = createFrameReader();
    expect(
      zero.push(Buffer.concat([frameLocally(""), frameLocally("after")])).map((frame) => [
        frame.length,
        frame.toString("utf8"),
      ]),
      "a length of zero is an empty frame, not the end of the stream - and the " +
        "frame after it still has to be read",
    ).toEqual([
      [0, ""],
      [5, "after"],
    ]);
  });

  test("ex8 - splitHeadersAndBody() stops at the blank line and leaves the body alone", () => {
    const head =
      "Content-Type: text/plain\r\n" +
      "X-Trace: abc\r\n" +
      "x-trace: def\r\n" +
      "Location: https://example.com:8443/orders\r\n";
    // A NUL, a two-byte character and a byte that is not valid UTF-8 at all.
    const rawBody = Buffer.concat([
      Buffer.from([0x00]),
      Buffer.from("café", "utf8"),
      Buffer.from([0xff]),
    ]);
    const message = Buffer.concat([Buffer.from(head, "utf8"), Buffer.from("\r\n"), rawBody]);

    const parsed = splitHeadersAndBody(message);
    expect(
      parsed.headers,
      "names are lower-cased because header names are case-insensitive, a " +
        "repeated header is joined with a comma and a space, and only the FIRST " +
        "colon splits the line - otherwise the port in that URL becomes a header " +
        "boundary",
    ).toEqual({
      "content-type": "text/plain",
      "x-trace": "abc, def",
      location: "https://example.com:8443/orders",
    });

    expect(Buffer.isBuffer(parsed.body), "the body comes back as a Buffer").toBe(true);
    expect(
      parsed.body.equals(rawBody),
      "byte for byte. A body that has been through toString() loses the 0xff " +
        "to a replacement character, and the length changes underneath a " +
        "content-length you already sent",
    ).toBe(true);

    const withSeparatorInside = Buffer.concat([
      Buffer.from("a: 1\r\n\r\n", "utf8"),
      Buffer.from("body line\r\n\r\nstill the body", "utf8"),
    ]);
    expect(
      splitHeadersAndBody(withSeparatorInside).body.toString("utf8"),
      "the FIRST blank line ends the headers; every later one is just bytes in " +
        "the body",
    ).toBe("body line\r\n\r\nstill the body");

    expect(
      splitHeadersAndBody(Buffer.from("a: 1\r\n\r\n", "utf8")).body.length,
      "a message with no body is an empty Buffer, not a missing one",
    ).toBe(0);

    expect(
      () => splitHeadersAndBody(Buffer.from("Content-Type: text/plain\r\n", "utf8")),
      "no blank line means the headers have not finished arriving. Guessing " +
        "that the whole buffer is headers is how a parser reports success on " +
        "half a message",
    ).toThrow(/blank line|CRLF/i);

    expect(
      () => splitHeadersAndBody(Buffer.from("a: 1\r\nnonsense\r\n\r\nbody", "utf8")),
      "and a header line with no colon names itself in the error, because the " +
        "one thing you want at 3am is which line",
    ).toThrow(/nonsense/);
  });
});
```

In plain English:

- **ex1** encodes bytes chosen so that ordinary base64 produces `+` and `/`,
  then decodes a padded string to prove the decoder is liberal.
- **ex2** checks the published LEB128 vectors, reads a varint out of the middle
  of a larger buffer, and rejects a truncated one.
- **ex3** puts a little-endian and a big-endian field in one header so reading
  either the wrong way is caught, then checks a short buffer and a bad magic.
- **ex4** splits on CRLF keeping the empty piece, then splits on a byte taken
  from the middle of a two-byte character.
- **ex5** feeds a two-byte character split in half, a four-byte one split three
  ways, and a sequence that never completes.
- **ex6** parses base64, percent-encoded and default-media-type forms, and
  rejects a URL with no comma.
- **ex7** delivers two frames in one chunk, one frame in three chunks, and a
  chunk holding a tail, a whole frame and a head at once.
- **ex8** joins a repeated header, keeps a URL with a port intact, and proves
  the body survived by putting a `0x00` and an invalid byte in it.

Next: **d15_readable_writable**, where the bytes start moving on their own.
