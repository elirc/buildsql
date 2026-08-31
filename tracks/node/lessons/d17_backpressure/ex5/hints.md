## Hint 1

Two thresholds instead of one is the whole idea. Pausing and resuming at the
same number makes the source flap — pause, resume, pause, resume, once per
chunk — and the cost of a pause is not zero. A gap between them lets the buffer
actually drain a little before the tap opens again.

`source.pause()` and `source.resume()` are the levers, and `sink.writableLength`
is the measurement.

## Hint 2

Pausing is easy: check after every write and pause when you are over
`pauseAbove`.

Resuming is the part that needs a moment's thought, because there is no event
for "the buffer got a bit smaller". `drain` fires only when the buffer is
completely empty, which is not the same as your `resumeBelow`. The hook you
want is the **per-chunk write callback**: `sink.write(chunk, () => { ... })`
runs when that chunk has been flushed, which is exactly when the length has just
gone down. Check the threshold there.

The rest is bookkeeping: a `paused` flag so you count each pause once, an
`end` handler that ends the sink and resolves when it has finished, and error
listeners on both streams so a failure is not a hang.
