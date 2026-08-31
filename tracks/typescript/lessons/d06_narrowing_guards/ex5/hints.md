## Hint 1

Trim the union to the three members with an answer. Then take the `Date` branch
first: `typeof new Date()` is `"object"`, so `typeof` cannot recognise it and
`instanceof` is the tool.

## Hint 2

The string branch has two rules of its own. A string of digits is a millisecond
count, and `Number(trimmed)` reads it. Anything else goes to `Date.parse`, which
returns `NaN` rather than throwing - so the failure has to be detected with
`Number.isNaN` and turned into your own error.

`Number("2026-03-01")` is `NaN`, which is why the two string rules cannot be
collapsed into one.

Left to you: a regular expression for "all digits", or `Number.isInteger(Number(trimmed))`.
They disagree about `" 12 "` and `"1e3"` - decide what a timestamp may look like.
