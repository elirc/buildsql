## Hint 1

`satisfies` checks a value against a type and then leaves the *inferred* type
in place. An annotation checks and replaces; `satisfies` checks and keeps.

## Hint 2

The target type is the constraint you want enforced, not the type you want the
constant to have. A record from `string` to the template literal type for a hex
colour says "any keys, hex values"; the keys the constant actually has survive
anyway, because they came from inference.

Left to you: whether `as const` belongs here too. Try adding it and see which of
the gate's assertions change - the answer is instructive either way.
