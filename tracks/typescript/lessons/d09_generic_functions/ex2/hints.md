## Hint 1

`T` appears in both parameters, so inference has to agree on one element type -
which is why `interleave([1], ["a"])` is a compile error rather than a union.

Return `T[]`.

## Hint 2

Loop to `Math.max(a.length, b.length)`, not to the minimum: the alternating
phase and the draining phase are then the same code, and each push is guarded by
a bounds check.

Left to you: this single loop, or an alternating loop followed by two
`concat`s of the leftovers. The first has one branch per list; the second has
two extra allocations.
