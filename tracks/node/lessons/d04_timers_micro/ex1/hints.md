## Hint 1

`delay` is the `new Promise` constructor with a `setTimeout` inside it, and the
resolver is the timer callback. Note that `setTimeout(resolve, ms)` passes
`resolve` directly — there is nothing to wrap.

Once the timer has fired it is finished, so there is nothing to clear: the
"leaves no timer behind" requirement is satisfied automatically as long as you
armed exactly one.

## Hint 2

`immediate` is the shorter of the two and the one people over-engineer.
"Resolve on the microtask queue" is the default behaviour of every already
settled promise — a `.then` on one is a microtask by definition.

So the question is not how to schedule a microtask; it is which single
expression is already a promise that has settled. `setTimeout(resolve, 0)` and
`setImmediate(resolve)` are both wrong here, and the gate proves it by counting
timers.
