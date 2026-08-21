## Hint 1

Chunk boundaries and line boundaries have nothing to do with each other. A
chunk can hold three lines, half a line, or one byte in the middle of a
character. So the transform needs a `pending` string: everything since the
last newline that has not been emitted yet.

Per chunk: append the new text to `pending`, split on `"\n"`, push every piece
*except the last*, and keep the last one as the new `pending`. The last piece
has no newline after it, so it might be incomplete.

## Hint 2

Two details the gate is strict about.

**Decoding.** `chunk.toString("utf8")` corrupts a character that straddles two
chunks - lesson 06 ex2, again. `node:string_decoder` exists for this:
`decoder.write(chunk)` returns the text that is safely decodable and keeps any
incomplete character back until the rest arrives; `decoder.end()` returns
whatever is left at the end.

**The output side is object mode.** You are pushing strings, one per line, so
set `readableObjectMode: true` on the constructor options. The writable side
stays in byte mode, because bytes are what arrives.

And `flush` emits the last line - but only if there is one. An input ending in
a newline leaves `pending` empty, and an empty final line is not a line.

## Hint 3

```ts
const decoder = new StringDecoder("utf8");
let pending = "";

return new Transform({
  readableObjectMode: true,

  transform(chunk: Buffer, _encoding, callback) {
    pending += decoder.write(chunk);
    const lines = pending.split("\n");
    pending = lines.pop() ?? "";
    for (const line of lines) this.push(/* what about \r? */);
    callback();
  },

  flush(callback) { /* the last line, if any */ },
});
```

Two decisions left: how you strip a trailing `\r` (Windows line endings are
`\r\n`, and the `\r` is not part of the line), and the exact contents of
`flush`. Reread the two assertions in the gate: one input ends mid-line and
one ends with a newline, and they want different numbers of lines out.
