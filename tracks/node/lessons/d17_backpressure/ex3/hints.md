## Hint 1

Backpressure comes from one place: how long you take to call the write
callback. A sink that calls it synchronously never lets its own queue build up,
so `write()` keeps returning true and the writer is never slowed down.

The bounded array is then just an array: push, and while it is over capacity,
`shift()` and count.

## Hint 2

Notice which end you drop from. Dropping the **oldest** keeps the most recent
data, which is what you want for metrics, traces and logs — the last thing that
happened before the incident is worth more than the first. Dropping the newest
is also a valid policy, and it is the one you want when the early data is a
handshake; the point is that it is a decision somebody made rather than an
accident of where the buffer overflowed.

Hand out a copy from `items()`. If a caller can mutate the array you are using
as your buffer, your sink has no control over its own contents.
