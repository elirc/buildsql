## Hint 1

`NonNullable<T>` removes `null` and `undefined` from a type. The return type is
`NonNullable<T> | undefined` - the `undefined` at the end is the "found nothing"
answer, not a value that survived the filter.

## Hint 2

`values.find(Boolean)` is the tempting one-liner and it skips `0`, `""` and
`false` - all of which are defined. The gate returns `0` from this function.

Check `value !== null && value !== undefined` (or the single `value != null`).
TypeScript will not see that those two checks remove exactly the two members
`NonNullable` removes, so one assertion on the way out is expected.

Left to you: the loop, or `find` with a type predicate helper. The second is
reusable and takes three more lines.
