## Hint 1

Two windows over the same thirteen rows: one accumulates, one totals. The difference between them is a single clause.

## Hint 2

`sum(revenue) OVER (ORDER BY month)` for the numerator and `sum(revenue) OVER ()` for the denominator. Without the `OVER ()` the bare `sum(revenue)` would be an aggregate in an ungrouped query and would be rejected.
