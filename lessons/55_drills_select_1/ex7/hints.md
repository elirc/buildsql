## Hint 1
`rating` is an `integer`. What type is `2`? What type is `2.0`? The result
type of a division is decided by its operands, and it decides whether the
remainder survives.

## Hint 2
Write the divisor exactly as the prompt gives it in each column - `2` in
one, `2.0` in the other. Then wrap the three-column list in `DISTINCT`; the
expressions are evaluated first, so only a few rows survive.
