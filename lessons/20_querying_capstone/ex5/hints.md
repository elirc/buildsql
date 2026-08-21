## Hint 1
The CTE has one row per buying customer with their order count. The
outer query counts those rows, twice - once unconditionally, once with a
FILTER.

## Hint 2
`round(100.0 * count(*) FILTER (WHERE orders >= 15) / count(*), 1) AS loyal_pct`
