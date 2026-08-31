## Hint 1

Handle `null` first, before anything else. `typeof null` is `"object"`, and
`null` is a legal JSON value - so getting it wrong fails in two directions at
once.

## Hint 2

Then the primitives, then arrays, then objects. Arrays and objects both recurse
with `every`, which gives you the "one bad value fails the document" rule for
free, and the empty cases for free as well.

## Hint 3

`Array.isArray` must come before the plain-object branch, because an array is
an object - the same ordering problem as d15 ex4.

Left to you: whether `NaN` should be rejected. The prompt says yes;
`JSON.stringify(NaN)` is `"null"`, so a document containing it does not survive
a round trip, and a guard that accepts it is promising something false.
