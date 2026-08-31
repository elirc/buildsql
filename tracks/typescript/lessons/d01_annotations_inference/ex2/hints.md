## Hint 1

Three jobs, in this order: make the input sane, split it into minutes and
seconds, then render each part to two characters.

Minutes are not capped at 59 in this drill - 3600 seconds reads `60:00`.

## Hint 2

`String(n).padStart(2, "0")` does the padding. `Math.floor(total / 60)` and
`total % 60` do the split. The sane-input step has to turn a negative and a
fraction into a whole, non-negative number *before* you divide, which is one
`Math.max` and one `Math.floor`.

Left to you: whether a fractional input rounds or truncates. Choose the one
that never reports a second that has not elapsed.
