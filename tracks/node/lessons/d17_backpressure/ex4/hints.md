## Hint 1

The transform callback means "send me another chunk". So the number of chunks
in flight is exactly the number of times you have called it without finishing
the work — which makes *when* you call it the only backpressure control the
stage has.

## Hint 2

The bug this is built around looks like this:

```ts
transform(chunk, _encoding, callback) {
  fn(chunk).then((value) => this.push(value));
  callback();                                   // <- says "ready for more"
}
```

It works. The right values come out in the right order. And it has told the
stream it is ready for the next chunk before it has done anything with this one,
so the entire source pours through and every item is in flight at once — an
unbounded fan-out onto whatever `fn` talks to, plus the whole input in memory.

Move the callback inside the `then`, and hand a rejection to it as an error. The
gate measures the difference by counting how much the source produced.
