## Hint 1

The return type is the exercise. A tuple type fixes both the length and the
type at each position: `[site: string, index: number]`. Those labels are for
readers and editor tooltips; they change nothing at runtime.

## Hint 2

`lastIndexOf("-")` finds the split point, and everything after it is the
candidate index. Two cases fall back to `[id, 0]`: no dash at all, and a tail
that is not made only of digits.

`/^\d+$/.test(tail)` is one way to ask that second question.

Left to you: a regular expression, or `Number.isInteger(Number(tail))` plus an
emptiness check. They disagree on `"roof- 3"` - decide which answer you want.
