## Hint 1
Each row needs a number the row itself cannot produce: the total across every category. That total has to be computed somewhere else and brought in.

## Hint 2
Two good routes. A scalar subquery in the `SELECT` list that recomputes the window's total revenue - it is uncorrelated, so it runs once. Or aggregate to one row per category first and then use `sum(revenue) OVER ()`, which totals the whole result set.

## Hint 3
Both operands are `numeric`, so `100 * x / total` does exact decimal arithmetic and there is no integer-division trap here - but keep the multiplication before the division, or you will round a fraction to zero on the way.
