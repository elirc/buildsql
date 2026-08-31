## Hint 1

The pattern is an object type, and object patterns can be as deeply nested as
you like. Write out the shape you expect - method, listener, state - and put
`infer` on the innermost piece.

## Hint 2

Be generous about the parts you do not care about. The listener's return type
and `subscribe`'s own return type should be as permissive as possible, or a
store that returns an unsubscribe function will not match the pattern.

Left to you: whether to write `subscribe(listener: ...): unknown` as a method or
as a property holding a function type. Both match here; one of them behaves
differently under `strictFunctionTypes`, and it is worth finding out which.
