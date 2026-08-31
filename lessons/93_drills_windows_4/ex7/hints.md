## Hint 1

Aggregate revenue by month and country first. Everything after that is two windows over the same twelve-ish rows per month.

## Hint 2

`sum(revenue) OVER (PARTITION BY month)` for the denominator and `row_number() OVER (PARTITION BY month ORDER BY revenue DESC, country)` to pick the top two - both in the same CTE, filtered one level up.

## Hint 3

The share must be computed before the `rn <= 2` filter. Filtering first would make the two percentages add up to 100 instead of to the roughly third of the month they really are.
