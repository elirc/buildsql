## Hint 1

Return `A & B`, as in ex4. The interesting part is the definition of "plain
object", because `typeof value === "object"` is true for arrays and for `null`
and the prompt says both of those replace rather than merge.

Write that as one small guard and use it twice - once for each side.

## Hint 2

Copy the first object into a fresh accumulator, then walk `Object.entries` of
the second. Recurse only when *both* the existing value and the incoming one
pass the guard; in every other case the incoming value wins outright.

Copying at each level is what keeps the inputs untouched at depth, which the
last two assertions check.

Left to you: whether arrays should concatenate instead of replacing. Real
merge utilities disagree with each other about this - have a position.
