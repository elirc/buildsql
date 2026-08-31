## Hint 1

Two handlers, not one: `.then(onFulfilled, onRejected)`. Each calls `onSettle`
with its own state label and then has to put the outcome back the way it found
it.

For the success path "put it back" means returning the value. For the failure
path it means something you have to write deliberately, because a rejection
handler that simply returns has *recovered* — the result fulfils with
`undefined` and the error vanishes.

## Hint 2

Do not wrap the `onSettle` calls in a `try`/`catch`. The requirement is that an
observer which throws replaces the outcome, and a throw inside a `.then` handler
already does precisely that.

The temptation to "protect" the pipeline from a broken logger is strong and
wrong: a logger that throws on every call is a bug you want to hear about on the
first request, not one you want swallowed for six months.

## Hint 3

One detail decides the first assertion: the gate compares the resolved value
with `toBe`, so it must be the **same object**, not a copy or a rebuilt shape.

That falls out if the success handler returns exactly what it was given. It does
not if you spread it, wrap it, or await it into a new structure — and the same
instinct applies to the reason on the failure path.
