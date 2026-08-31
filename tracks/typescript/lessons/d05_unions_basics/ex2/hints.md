## Hint 1

Fix the union first, then think about order. Two different members render as
`"-"`, and only one of them can be trimmed - so the `null` check has to happen
before you touch any string method.

## Hint 2

`if (!value) return "-"` is the tempting one-liner and it also swallows `0`,
which the gate checks. Ask each question of the value it applies to: `=== null`
for the empty cell, `typeof value === "number"` for the number, and only then a
trim on what must be a string.

Left to you: a ternary or an `if` for the final blank-string case. Same code;
one of them survives a fourth rule being added next month.
