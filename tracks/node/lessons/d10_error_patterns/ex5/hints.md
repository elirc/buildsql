## Hint 1

An `async` wrapper with a `try`/`catch`, returning a new arrow function that
takes the same arguments and passes them straight through with `...args`.

The catch builds a **new** `Error` — `` new Error(`${context}: ${message}`, {
cause: error }) `` — rather than touching the one it caught. That object may be
held by a retry loop, a logger, or three other frames, and rewriting its message
under them is a genuinely unpleasant bug.

## Hint 2

`return await fn(...args)` inside the `try`, not `return fn(...args)`.

Without the `await`, the function returns the pending promise immediately, the
`try` block ends, and the rejection arrives when nothing is watching — so the
caller gets the original error with no context at all. Most linters flag `return
await` as redundant; inside a `try` it is load bearing, and this is the
canonical counterexample.

## Hint 3

The message has to survive a non-Error rejection, because a `throw "..."` two
libraries down is not your choice. Read `.message` when it is an `Error` and
`String(thrown)` otherwise.

The remaining decision is what to do when the same wrapper is applied at three
levels of a call stack. You get `a: b: c: ECONNREFUSED`, which is genuinely
useful — and `cause` gives a reader the structured version of the same thing.
Decide whether you would ever want to collapse it.
