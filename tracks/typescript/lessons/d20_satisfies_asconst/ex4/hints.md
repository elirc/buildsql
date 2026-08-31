## Hint 1

You want both operators, in this order: `as const` to keep the literals and
make the tuple readonly, then `satisfies` to check the frozen value against the
shape. `expr as const satisfies T` is legal and reads left to right.

## Hint 2

Because `as const` makes the array readonly, the `satisfies` target has to be
`readonly ...[]` as well - a readonly array is not assignable to a mutable one.

The derived types are already written for you; they only start saying something
once `typeof ROUTES` is a tuple of literal objects.

Left to you: whether `RoutePath` should be `"/" | "/users"` or should include
duplicates. Unions deduplicate on their own, which is worth noticing rather than
assuming.
