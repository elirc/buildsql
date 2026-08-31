## Hint 1

`writableLength` is a number you can read at any moment, and it is the only
honest measure of how far behind a sink is. Round-robin ignores it and gives the
stalled consumer exactly as much as the healthy one; choosing the smallest
`writableLength` discovers the slow one instead of being told about it.

## Hint 2

`for await (const chunk of source)` gives you the backpressure on the source
side for free: while the body of the loop is awaiting something, nothing is
pulled. So the shape is — if every sink is full, await; then pick and write.

"Full" is `sink.writableLength >= sink.writableHighWaterMark`, per sink. Do not
invent your own ceiling: the sinks were constructed with one.

## Hint 3

The wait is the interesting part. You need "one of them has room again", which
means listening for `drain` on **all** of them and taking the first — with a
cleanup that removes every listener, including the ones that did not fire.

Two things worth knowing before you write it. `drain` fires only when a sink's
buffer reaches zero, not when it merely drops below the highWaterMark, so a
saturated set can take a while to unblock — that is correct, but it means you
must not also require your own lower threshold on top of it. And a sink that
errors while you are waiting will never drain, so the error listener is not
optional.

What the counts should be when a sink fails half way through is not something
the gate checks, and it is the first question a reviewer will ask.
