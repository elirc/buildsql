## Hint 1

One listener per named event, each of which does exactly one thing: re-emit on
the target under the prefixed name with the same arguments. `(...args)` in and
`...args` out — do not unpack them, because you do not know how many there are.

## Hint 2

The unsubscribe is the real content. To remove a listener you must pass
`emitter.off` the **same function reference** you passed to `on` — a
freshly-written identical arrow is a different function and removes nothing,
silently.

So build each listener into a variable, keep the `[event, listener]` pairs, and
have the returned closure walk them.

## Hint 3

Two traps the gate checks explicitly.

`source.removeAllListeners(event)` is not an unsubscribe, it is a hostile act:
the gate puts an unrelated listener on `"query"` before calling you and checks it
is still there afterwards.

And calling the unsubscribe twice must be harmless. `off` on an
already-removed listener is a no-op anyway, so this is nearly free — but decide
whether you would rather express it by emptying the list, and what that buys you
if the same listener were somehow registered twice.
