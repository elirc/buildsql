## Hint 1

`T[number]` is the element type of an array or tuple - `number` for a
`number[]`, and `"a" | "b"` for a `readonly ["a", "b"]`. Add `| undefined`,
because the index may miss.

## Hint 2

Convert a negative index once, then range-check once. `values[-1]` in JavaScript
reads a property named `"-1"` and returns `undefined`, so a negative index has to
be turned into `values.length + index` before it is used.

The fractional case is easiest to reject up front with `Number.isInteger`.

Left to you: your own bounds check, or `Array.prototype.at`, which already
handles negatives. If you use `at`, you still owe the fractional case an answer.
