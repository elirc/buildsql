## Hint 1

Say the rules out loud before you write anything down, because that is what
you will have to do in the room:

1. synchronous code runs to completion first;
2. then the `process.nextTick` queue, drained to empty;
3. then the microtask queue (promises), drained to empty;
4. then the timers, in the order they were scheduled.

Six of the seven labels fall out of those four lines.

## Hint 2

The seventh is the one that separates answers. One of the timer callbacks
schedules a `process.nextTick` *while it runs*. The checkpoint - drain
nextTicks, drain microtasks - happens between **every** callback, not between
phases, so that tick runs before the next timer, not after all of them.

Write the two synchronous labels, then the checkpoint labels, then walk the
timers one at a time, running the checkpoint after each.

## Hint 3

Seven strings. The first two are the `log` calls that are not inside any
callback. Then one nextTick, then one promise callback, then the first timer -
and immediately after that timer, before the second one, whatever it queued.

If the gate says you diverge at position 5, you have the phases right and the
"checkpoint after each callback" rule wrong, which is the most common way to
be nearly right about this.
