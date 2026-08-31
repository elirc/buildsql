## Hint 1

Pin each `kind` to its own string literal - `"insert"`, `"select"`, `"refund"`.
Comparing a `string` against `"insert"` proves nothing; comparing a
`"insert" | "select" | "refund"` against it proves everything.

## Hint 2

`switch (cmd.kind)` with a `return` in each `case` gives you a fully narrowed
`cmd` inside every branch, so `cmd.cents` and `cmd.slot` are legal exactly where
they exist.

Note that `refund` carries nothing but its tag. That is a complete variant, not
an oversight.

Left to you: whether to add a `default` branch that passes `cmd` to a
`never`-typed helper. The gate does not need it; the habit is worth having.
