## Hint 1

Three things read the per-customer revenue: the averaging step, the filter, and the output column. That is one CTE with two consumers.

## Hint 2

`WITH per_customer AS (...), stats AS (SELECT avg(revenue) AS avg_revenue FROM per_customer)` and then `FROM per_customer pc CROSS JOIN stats s`, filtering on `pc.revenue > 1.8 * s.avg_revenue`.

## Hint 3

`above_average` is `round(revenue - avg_revenue, 2)` - the rounding happens on the difference, after the comparison has already used the raw average.
