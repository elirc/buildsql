## Hint 1

Everything exercise 2 asked for by hand, this factory has to do for any type.
Look at what the stub does with its `name` parameter: nothing. That is the
missing half.

## Hint 2

The cast in `useValue` is the tell — it promises TypeScript a `T` while the
value may really be `null`. Replace the cast with the check that makes the
promise true, and throw a message built from the captured `name`.

## Hint 3

Note what a closure buys you: `Context` and `name` are created once per call to
the factory, and the `Provider` and `useValue` returned both see them. Two
calls make two contexts that cannot see each other, which is exactly what the
gate checks.
