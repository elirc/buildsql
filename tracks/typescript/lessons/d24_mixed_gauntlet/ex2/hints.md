## Hint 1

Three topics: `as const satisfies` (d20), `keyof typeof` and indexed access
(d11). The two derived types are already written; the declaration is what makes
them mean something.

## Hint 2

`Object.keys` returns `string[]` no matter how precisely the object is typed -
that is deliberate, because an object may have more keys at runtime than its
type admits. One assertion at that line is the accepted cost.

Left to you: whether to sort explicitly. The insertion order of the object
happens to be ascending here; relying on that is the kind of decision that
survives until someone reorders the table.
