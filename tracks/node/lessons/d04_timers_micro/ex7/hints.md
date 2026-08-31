## Hint 1

`setInterval` cannot do this, and that is the point of the exercise. It measures
each gap from when the previous callback *finished*, so a handler that takes
30ms pushes every future tick 30ms further out — a minute of one-second ticks
ends up half a tick late, and an hour ends up minutes late.

So: `setTimeout`, re-armed from inside the callback, with the delay recomputed
each time.

## Hint 2

Keep the *grid* rather than the gap. Record the start time once, count the ticks,
and the deadline for the next tick is

```
startedAt + (count + 1) * intervalMs
```

The delay you hand `setTimeout` is that deadline minus `now()`. Nothing about
the handler's cost appears in the formula — it falls out of the clock reading.

## Hint 3

Two guards finish it.

The delay must not go negative: if the handler overran the whole interval, the
next tick is already due and the right answer is zero, not a negative number
that `setTimeout` will quietly reinterpret.

And `stop()` has to clear the pending timeout and forget the handle, so a
`start()` after it does not end up with two chains running — which is the same
mistake as ex2, one level of indirection further in.
