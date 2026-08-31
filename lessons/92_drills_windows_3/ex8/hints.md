## Hint 1

Three steps: customers per country, then the accumulation and its share, then the cut at 80%.

## Hint 2

The running count is `sum(customers) OVER (ORDER BY customers DESC, country)` and the denominator is `sum(customers) OVER ()`. Both belong in a CTE, because a window result cannot be used in `WHERE` at the same level.

## Hint 3

`cum_pct` is `round(100.0 * <running> / <total>, 2)`, and the filter keeps the rows where it is at most 80 - which stops one row before the 80% mark is actually crossed.
