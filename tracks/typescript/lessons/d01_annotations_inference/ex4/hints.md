## Hint 1

Two annotations to get right and one habit to keep. `readonly number[]` as the
parameter type is a promise you will not modify the caller's array; the same
type as the return type is that promise made back to them.

`sort()` sorts in place, so it cannot be the first thing you call on `values`.

## Hint 2

Copy, sort the copy with a numeric comparator, then `slice(0, count)`. The
default `sort()` compares stringified elements, so `[9, 10]` comes back
`[10, 9]` without `(a, b) => b - a`.

`slice` already clamps a count larger than the array, so the only branch worth
writing is a count that is zero or negative.

Left to you: `[...values]` or `values.slice()` for the copy. Both are correct.
