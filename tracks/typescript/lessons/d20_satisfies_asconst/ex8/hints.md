## Hint 1

The declaration is the same `as const satisfies` shape as ex4 and ex7. Get that
right and `FlagName` and `Flags` - both already written - start producing real
types with no further edits.

## Hint 2

`Flags` only works because each flag's `kind` is a literal. Under the stub's
annotation, `(typeof FLAGS)[K]["kind"]` is the whole union, no branch of the
conditional can be chosen, and the member type collapses.

## Hint 3

For `defaults()`, read the values back out of `FLAGS`. Each `default` is a
literal - `false`, `3`, `"dist"` - and each is assignable to the widened member
type the mapped type produced, so no cast is needed anywhere.

Left to you: whether to build the result by hand or with a loop over
`Object.keys(FLAGS)`. The loop is shorter to write and needs a cast to
typecheck; three lines need none. Decide which trade you want.
