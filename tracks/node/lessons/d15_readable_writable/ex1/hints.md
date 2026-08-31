## Hint 1

A hand-built source is `new Readable({ objectMode: true, read() { ... } })`.
The machinery calls `read()` whenever it wants more; you answer with `push`.
Without `objectMode` every number you push is coerced into a Buffer on the way
out.

## Hint 2

Keep the cursor in a closure variable and let `read()` push one value and
advance it. The end of the stream is `this.push(null)` — and the empty-range
case falls out for free if the "past the end" check comes **first**, because the
very first `read()` then ends the stream before anything is produced. A stream
that never pushes null is a consumer that hangs forever, which is exactly what
the gate's empty-range test would do.
