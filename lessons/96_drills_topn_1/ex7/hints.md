## Hint 1

Two grains at once: revenue is aggregated per *day*, but the winner is picked per *month*. Group by both truncations, then rank days inside their month.

## Hint 2

CTE one: `GROUP BY date_trunc('month', ...), date_trunc('day', ...)` with `sum(total)`. A day belongs to exactly one month, so grouping by both simply keeps the month label available for the partition.

## Hint 3

CTE two ranks with `row_number() OVER (PARTITION BY month ORDER BY revenue DESC, day)`; the outer query keeps `rn = 1` and orders by `month`. Thirteen months, thirteen winners - the two partial months at the ends still have a best day.
