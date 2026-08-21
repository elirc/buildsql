## Hint 1

A `Transform` is a `Writable` and a `Readable` welded together: what you write
in comes out the other side, changed. You implement one method,
`transform(chunk, encoding, callback)`, and optionally a second, `flush`.

`callback(null, value)` is shorthand for "push this value, and I am ready for
the next chunk". `callback()` on its own means "I consumed that chunk and have
nothing to emit for it yet" - which is how a batching or buffering transform
works.

## Hint 2

`flush(callback)` is called once, after the last chunk, before the readable
side ends. It is the only chance to emit something that depends on having seen
everything - a summary, a closing bracket, a final partial line.

Inside both methods `this` is the stream, so `this.push(value)` works in
`flush` where there is no second callback argument to use.

The chunk counter lives in the closure around the constructor call, exactly
like the counter in lesson 06 ex3.

## Hint 3

```ts
let chunks = 0;

return new Transform({
  transform(chunk: Buffer, _encoding, callback) {
    chunks += 1;
    callback(null, /* the transformed chunk */);
  },

  flush(callback) {
    this.push(/* the summary */);
    callback();
  },
});
```

Two decisions left: the transformation itself, and the exact summary text (the
gate wants `[3 chunks]`, square brackets included, and `[0 chunks]` for an
empty input - so the flush must run unconditionally). One honest caveat worth
noting: uppercasing a chunk at a time is only safe because this gate feeds
ASCII. Text transforms that must survive arbitrary UTF-8 need the decoder you
will meet in ex3.
