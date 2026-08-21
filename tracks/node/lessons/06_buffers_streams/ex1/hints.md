## Hint 1

Draw the frame on paper first:

```
byte 0    byte 1    byte 2    byte 3 ...
version   length hi length lo  payload bytes
```

Then note the trap in the middle: the length is the number of **bytes** the
payload takes up in UTF-8, which is not the number of characters in the
string. `"café".length` is 4; the number of bytes is 5.

## Hint 2

For encoding: turn the payload into a `Buffer` first (`Buffer.from(text,
"utf8")`), because then its `.length` *is* the byte count you need. Allocate a
3-byte header with `Buffer.alloc(3)`, fill it with `writeUInt8` and
`writeUInt16BE`, and `Buffer.concat([header, body])`.

For decoding: `readUInt8(0)` and `readUInt16BE(1)` read the header back, and
`buffer.subarray(start, end)` gives you a view of the payload bytes to decode
with `.toString("utf8")`.

`BE` is big-endian - the most significant byte first. It is the convention for
anything on a wire, which is why it is also called network byte order.

## Hint 3

```ts
export function encodeFrame({ version, payload }: Frame): Buffer {
  const body = Buffer.from(payload, "utf8");
  const header = Buffer.alloc(3);
  header.writeUInt8(version, 0);
  header.writeUInt16BE(/* what value, at what offset? */);
  return Buffer.concat([header, body]);
}
```

Two decisions left in the encoder (the value and the offset for the length),
and one in the decoder: where the payload *ends*. The gate appends junk after
a valid frame and expects you to ignore it, so the end comes from the length
field, not from `buffer.length`. That is the difference between a parser and a
guess.
