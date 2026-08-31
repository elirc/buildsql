## Hint 1

The stub accepts a `ref` prop, declares its own ref, and attaches the wrong one
of the two to the input. Ask which node the parent believes it is holding.

## Hint 2

In React 19 `ref` is an ordinary prop for function components — there is
nothing to unwrap and no `forwardRef` to write. The internal ref in the stub is
not needed at all here; this component has no imperative work of its own.
