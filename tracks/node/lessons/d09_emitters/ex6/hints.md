## Hint 1

One map from event name to a list of registrations, where a registration is the
listener plus a flag saying whether it is a `once`. `on` and `once` are the same
code with that flag flipped, so write one private `add`.

`emit` walks a **copy** of the list — dispatch is exactly when listeners tend to
add and remove listeners.

## Hint 2

Remove a `once` registration **before** calling it, not after. A listener that
re-emits the same event during its own call would otherwise be found still
registered and run again — and the two orders differ in exactly the case that is
hardest to debug.

`off` has to find the registration by the function the caller originally passed,
which is why the registration keeps a reference to it rather than only to a
wrapper.

## Hint 3

The `"error"` rule is the point of the exercise. An emitter with no listener for
`"error"` throws rather than silently dropping it — that is why an unhandled
stream error crashes a Node process instead of leaving it wedged, and it is
deliberate: a failure nobody is watching should be loud.

Throw the argument itself when it is an `Error`, so the stack trace is the real
one. When it is not, wrap it, because throwing a bare string helps nobody.

The remaining decision: should `emit` return `true` or `false` for an `"error"`
that threw? It never returns at all — say why that is not a cop-out.
