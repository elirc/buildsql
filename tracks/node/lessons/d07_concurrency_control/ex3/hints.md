## Hint 1

The shape is: a list of not-yet-started runners, a count of running ones, and a
`pump()` that starts runners while there is room. `push` builds a runner, puts it
on the list, and calls `pump()`.

The runner is a closure over `resolve` and `reject` from the promise `push`
returned — that is how each caller gets its own outcome.

## Hint 2

The critical difference from an array-in / array-out limiter: the queue must
never *observe* a task's rejection as its own failure. Route the settlement to
the caller (`.then(resolve, reject)`) and hook the slot release onto `.finally`,
which runs on both outcomes.

If the slot release is only on the success path, one failing task permanently
shrinks your concurrency by one — a queue that quietly grinds to a halt after a
few errors, which is a genuinely hard bug to see.

## Hint 3

`onIdle` needs a list of waiters, resolved when a task finishes and both
counters reach zero. Return an already-resolved promise if the queue is idle
when it is asked, or the caller waits for an event that has already happened.

The remaining decision is where the idle check goes. Putting it inside the same
callback that releases the slot is simplest — but make sure `pump()` has had its
chance to start the next task first, or a queue with work still waiting will
briefly declare itself idle.
