## Hint 1

Nothing says the two windows in a query have to agree about order, or that either has to agree with the query's own `ORDER BY`.

## Hint 2

`sum(revenue) OVER (ORDER BY month)` and `sum(revenue) OVER (ORDER BY revenue DESC, month)` side by side, with the rows themselves emitted in month order by the outer `ORDER BY`.
