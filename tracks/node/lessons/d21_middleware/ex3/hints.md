## Hint 1

You cannot write this with a `for` loop, because each middleware decides *when*
the next one runs — possibly never, possibly after an await. The shape is a
recursive `step(index)` that each middleware advances by calling the `next` you
handed it.

## Hint 2

Two things end the chain early, and they end it differently.

A middleware that **responds** simply never calls `next`, so `step` is never
called again and nothing else runs. You do not detect this; it falls out of the
design.

A middleware that calls `next(error)` must not advance the stack. Look at what
you were handed: if it is anything other than `undefined`, forward it to the
**outer** `next` and stop. That covers `next("route")` too, which is not an
error but is also not "carry on here".

When you run off the end of the array, call the outer `next()` — that is what
makes the composition a drop-in for the stack it replaced.
