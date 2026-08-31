## Hint 1

`value: T[K]` is the whole type-level fix: the value has to be of the type that
key holds, which is what makes `setValue(item, "a", "2")` a compile error.

## Hint 2

The body spreads into a fresh object with a computed key:
`{ ...source, [key]: value }`.

TypeScript widens a computed-key spread to an index signature and cannot see
that the result is still a `T`, so one `as T` is expected. It is safe precisely
because `value` was already constrained.

Left to you: the cast, or a mapped-type return that describes the change. The
second is a real exercise in its own right - know that it exists.
