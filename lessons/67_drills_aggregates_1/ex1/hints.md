## Hint 1

One `WHERE` clause restricts every aggregate in the row, so the category filter goes there rather than inside each function.

## Hint 2

`round(avg(price), 2)` - the two-argument `round` only exists for numeric, which is what `price` and its average already are.
