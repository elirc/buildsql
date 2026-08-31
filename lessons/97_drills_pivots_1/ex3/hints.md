## Hint 1

The grouping key is a computed value - the month each order fell in - and the
four status columns are conditional counts over the rows of that month.

## Hint 2

`GROUP BY date_trunc('month', created_at)` (repeat the expression, or use
the ordinal `1`), then one `count(*) FILTER (WHERE status = ...)` per status.
Nothing belongs in `WHERE`: every order contributes to some column.
