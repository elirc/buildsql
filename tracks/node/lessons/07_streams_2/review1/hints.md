## Hint 1

One chunk in, one object out, so there is no buffering and no `flush` - the
transform is four lines plus error handling.

The readable side carries objects, so `readableObjectMode: true`, exactly as
in ex3. The writable side stays in byte mode: what arrives is a `Buffer`.

## Hint 2

`JSON.parse` throws, and a `transform` implementation must never let a throw
escape - the stream machinery is calling you, and an exception there is not
routed anywhere useful. The supported way to fail is
`callback(error)`, which destroys the stream and, under `pipeline`, tears the
whole chain down and rejects.

So: `try` around the parse only, `callback(error)` in the catch, and
`callback(null, parsed)` on the success path.

## Hint 3

```ts
transform(chunk: Buffer, _encoding, callback) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(chunk.toString("utf8"));
  } catch (error) {
    /* fail the stream, and then? */
  }
  callback(null, parsed);
}
```

Two decisions left: what goes in the catch, and the `return` that has to
follow it. Calling `callback` twice for one chunk is its own error
(`ERR_MULTIPLE_CALLBACK`) - falling through from the catch into the success
call is the easiest way to do it by accident.
