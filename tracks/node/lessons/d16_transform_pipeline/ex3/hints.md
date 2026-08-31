## Hint 1

One array in the closure. `transform` appends to it and pushes it on only when
it is full; `flush` is where the leftovers go.

`flush(callback)` is the second option a `Transform` takes. It runs once, after
the last chunk and before the stream ends, and it is the only place a stage gets
a last word.

## Hint 2

Two details decide whether this is right.

After pushing a full batch, start a **new** array rather than emptying the one
you just pushed — downstream now owns that array, and `batch.length = 0` would
empty it under their feet.

In `flush`, push only if there is something to push. Without that guard an input
whose length divides exactly by `size` ends with a stray `[]`, and every
consumer downstream grows an `if (batch.length)` to work around your bug.
