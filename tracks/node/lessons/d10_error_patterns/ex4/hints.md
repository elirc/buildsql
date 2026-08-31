## Hint 1

A `while` walking `current = current.cause`, pushing the message each time. The
loop ends when the cause is not another `Error` — which covers both "no cause at
all" and "a cause holding some data", because `undefined instanceof Error` is
`false` and so is `{ row: 3 } instanceof Error`.

`root` is whatever `current` is holding when the loop stops, and `depth` is the
length of the array you built.

## Hint 2

`cause` is not in TypeScript's `Error` type in every configuration, so you may
need `(current as Error & { cause?: unknown }).cause` to read it. That cast is
also a good moment to notice that `cause` is typed `unknown` on purpose: it is
allowed to hold literally anything.

## Hint 3

The loop guard is a `Set` of the errors already visited, keyed by **identity**
rather than by message — two genuinely different errors are allowed to say the
same thing.

Cycles are not hypothetical: any wrapper that attaches a caught error as the
cause of a new one, inside a retry loop that re-wraps, can build one. Without
the guard `explain` hangs the process, which is a spectacular way for an error
reporter to fail.

The remaining decision is where `root` should point when a loop is detected.
This version says "the last error reached before the repeat" — say why that is
more useful than throwing.
