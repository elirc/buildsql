## Hint 1

Three pieces of state: an array of items not yet sent, a `busy` flag, and an
`ended` flag. One function — call it `flush` — reads all three and decides what
to do, and both `write()` and the sink's write callback simply call it.

## Hint 2

`flush` has exactly three cases, in this order:

- busy → do nothing, the callback will come round again;
- nothing pending → if `end()` has been called, end the sink; otherwise nothing;
- otherwise → `splice(0, maxBatch)` off the front, mark busy, and write that
  array with a callback that clears busy and calls `flush` again.

The `splice` is what enforces the cap. Without it a long stall turns into a
single enormous batch, which is the failure this design was supposed to avoid —
you have moved the unbounded buffer from the sink into your own array.

## Hint 3

`end()` is not "stop". It is "no more items are coming", and it has to return a
promise that stays pending until the remainder has been flushed **and** the sink
has finished. Note that `sink.end(callback)` fires on `finish`, which is later
than the last write callback — resolving any earlier is how the final batch
never reaches the disk.

The decision left to you is what `write()` should do after `end()`. Throwing,
ignoring, and quietly accepting are all defensible; a reviewer will ask which
one you chose.
