## Hint 1

`this.push()` may be called as many times as you like inside one `transform` —
zero, once, or twenty. That is the whole difference between a map and an expand,
and it means an empty result needs no special case at all.

## Hint 2

The two shapes need two loops: `Array.isArray()` picks between a `for...of` and
a `for await...of`.

`transform` may be declared `async`; the stream ignores what it returns and
waits for your callback either way. Drain the async iterable **completely**
before you call it, though — calling the callback early lets the next input in
while yours is still producing, and the outputs interleave.

Keep the `try`/`catch` from ex1: an async iterable can reject, and it has to
become a stream error rather than an unhandled rejection.
