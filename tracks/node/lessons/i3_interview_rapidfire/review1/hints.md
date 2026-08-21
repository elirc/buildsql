## Hint 1

Two synchronous labels, one nextTick, a chain of two promise callbacks, and a
timer that queues a nextTick while it runs. Seven labels in total.

Group them by queue before you order them, exactly as you did in lesson 02.

## Hint 2

The chained `.then` is the new part. The second callback is not queued when
you write the chain - it is queued when the *first* one settles, which happens
during the microtask drain. So it joins the back of the drain in progress and
runs in the same pass, immediately after its predecessor.

The last part is the checkpoint after a timer callback: a `process.nextTick`
scheduled inside a timer runs before the loop moves on, not at the end of
everything.

## Hint 3

Order of business: the synchronous lines, the nextTick queue, the microtask
queue (both links of the chain), the timer, then the checkpoint again.

The decision left to you is what happens after the timer logs. If you put that
last label anywhere other than immediately after the timer, reread the
"checkpoint runs after every callback" rule - it is the single most useful
sentence about the event loop, and this is its clearest demonstration.
