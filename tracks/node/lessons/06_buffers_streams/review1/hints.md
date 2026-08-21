## Hint 1

Same frame format as ex1, several of them end to end. That means one piece of
state you did not need before: a cursor saying where the next frame starts.

The loop is: read a header at the cursor, take that many payload bytes, record
the frame, move the cursor past everything you consumed, repeat.

## Hint 2

Every read has to be offset by the cursor - `readUInt8(offset)`,
`readUInt16BE(offset + 1)`, `subarray(offset + 3, ...)`. Getting one of those
offsets wrong shifts everything after it, which is why binary parsers are
usually written with a named `start` for the payload rather than three
different `offset + n` expressions.

The loop condition is "is there at least a whole header left?" - a header is
three bytes, so `offset + 3 <= buffer.length`.

## Hint 3

```ts
let offset = 0;
while (offset + 3 <= buffer.length) {
  const version = buffer.readUInt8(offset);
  const length = buffer.readUInt16BE(offset + 1);
  const start = offset + 3;
  frames.push({ version, payload: /* ? */ });
  offset = /* where does the next frame begin? */;
}
```

Two decisions left, and the second is where the bug lives if the second frame
comes out as gibberish. Check the zero-length payload case by hand: a frame
with an empty payload consumes exactly three bytes and must still appear in
the output - if your loop treats "length is 0" as the end, you lose it.
