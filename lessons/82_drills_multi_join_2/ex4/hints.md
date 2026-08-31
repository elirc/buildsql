## Hint 1
Sales and reviews are two independent one-to-many branches off `products`. Put both in the same `FROM` and every sales line is repeated once per review of that product.

## Hint 2
Roughly a hundred times, in this dataset. `count(DISTINCT ...)` could rescue a count, but `sum(oi.quantity)` cannot be rescued at all - there is no way back from a multiplied sum.

## Hint 3
Aggregate each branch separately - one CTE per branch, both grouped by category - and join the two summaries on `category`. Notice that the average rating is unaffected by the fan-out even when the sums are destroyed by it, which is exactly why the bug is so hard to spot.
