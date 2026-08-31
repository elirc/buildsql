## Hint 1

A `new Promise` with one listener per name plus one for `"error"`. Each listener
settles the promise — and because a promise ignores every settlement after the
first, you do not need a flag to work out who won.

What you *do* need is the ability to remove the listeners afterwards, which
means keeping a reference to every one you attached. An inline arrow function
you did not save cannot be removed.

## Hint 2

Collect them as pairs of `[eventName, listener]` and write one `cleanup()` that
walks the list calling `emitter.off`. Call it from every settling path.

Do not reach for `removeAllListeners()`. The emitter is not yours: the gate
proves the point in ex3 by putting somebody else's listener on the same event.

## Hint 3

The `"error"` listener earns its place twice over. It rejects the promise, and —
more importantly — its mere existence stops the emitter throwing.

An `EventEmitter` that emits `"error"` with no listener throws the argument
synchronously, which in Node means an uncaught exception and a dead process.
Attaching a handler is how you convert that into a rejection you can `await`.

The remaining decision: what if `"error"` is one of the `names` the caller
passed? Say what your implementation does, and whether that is the behaviour you
would document.
