## Hint 1

A `Readable` you build yourself has one job to implement: `_read()`, the
method the stream machinery calls when it wants more data. You supply it as
the `read` option to the constructor:

```ts
new Readable({
  read() {
    // push the next piece - or signal the end
  },
});
```

Inside `read`, `this` is the stream, so `this.push(value)` hands a chunk to
the consumer.

## Hint 2

Two rules about `push`:

- `this.push(chunk)` delivers a chunk. Strings are converted to `Buffer`s
  unless the stream is in object mode, which is why the gate can assert the
  consumer receives Buffers.
- `this.push(null)` means "that was the last one". Without it the consumer
  waits forever - and "my for-await never finished" is nearly always a missing
  `push(null)`.

The counter itself is state that has to live outside `read`, because `read` is
called many times: a `let` in the enclosing function, captured by the closure.

## Hint 3

```ts
let next = 1;

return new Readable({
  read() {
    if (/* have we run out? */) {
      this.push(null);
      return;
    }
    this.push(String(next));
    next += 1;
  },
});
```

Two decisions left: the exhaustion test (mind the boundary - `createCounter(3)`
emits 1, 2, 3 and `createCounter(0)` emits nothing at all) and whether you push
a string or a number. Push a number into a non-object-mode stream and Node
throws immediately, which is a useful thing to see once on purpose.
