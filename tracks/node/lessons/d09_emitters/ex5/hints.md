## Hint 1

The push/pull adapter again, and it wants four pieces of state: a queue, a
"finished" flag, a place to keep an error, and a "wake me" resolver for when the
consumer is waiting on an empty queue.

Three listeners feed them — one for `name`, one for `"end"`, one for
`"error"` — and each ends by waking the consumer if it is asleep.

## Hint 2

Where the listeners are attached matters enormously. If `iterateEvents` is
itself an `async function*`, its body does not run until the consumer's first
`next()` — and every event emitted before that is gone.

So attach eagerly in an ordinary function, and return an object with a
`[Symbol.asyncIterator]` method that *is* the generator. The gate emits two
events before the consumer gets a turn, precisely to catch this.

## Hint 3

The loop: drain the queue with `yield`, then check the terminal states, then
sleep on a fresh wake promise. That order is what makes the error case deliver
the buffered values first, which the gate checks.

Cleanup goes in a `finally` around the whole loop. It then runs on all three
exits — the natural end, the thrown error, and a consumer that breaks out early
— and only that last one is easy to forget, because it never appears in the
happy path.

The remaining decision is what to do about an unbounded queue. A producer faster
than its consumer will grow this forever, and the real answer is backpressure.
