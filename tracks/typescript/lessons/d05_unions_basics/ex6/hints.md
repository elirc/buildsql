## Hint 1

The return type is the promise: `string[]`. Nothing that comes out is nullish,
so nothing in the type should be either.

Then the trap: `""` is falsy and is not nullish, and the gate keeps it.

## Hint 2

`values.filter(Boolean)` reads beautifully, drops the empty string, and does not
narrow the element type - two bugs in one idiom.

`value !== null && value !== undefined` narrows honestly. So does the single
loose check `value != null`, which is the one place `!=` is idiomatic.

Left to you: `!= null` or the two strict checks. The short one needs a comment
in most teams; the long one does not.
