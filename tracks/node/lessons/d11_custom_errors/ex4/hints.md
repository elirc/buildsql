## Hint 1

Look the name up in the registry, construct either that class or a plain
`Error`, then put the extra fields back and recurse into the cause.

Note the constructor signature the registry promises: `new (message: string)`.
That is a real constraint on which classes can be registered, and it is worth
noticing that ex1's `NotFoundError(resource, id)` does *not* fit it.

## Hint 2

Set `name` after constructing, unconditionally. For a known class it is usually
already right; for an unknown one it is the only surviving clue about what
failed on the other machine, and losing it turns a `TimeoutError` into a
featureless `Error`.

Look the registry up with `Object.prototype.hasOwnProperty.call(...)` rather
than a bare `registry[name]`. A serialised name of `"constructor"` or
`"toString"` finds something on `Object.prototype` otherwise — and the payload
came off a wire, so somebody else chose that string.

## Hint 3

This is where deserialising errors gets genuinely dangerous, and it is worth
saying so out loud in an interview: a registry is an **allow list**. The
alternative people reach for — looking the name up in a global scope, or
`eval`-ing it — lets a remote payload construct anything at all in your process.

The remaining decision is what to do when the payload has a `cause` that is not
an object at all. The type says it is a `SerialisedError`; the wire disagrees
whenever it feels like it.
