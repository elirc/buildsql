## Hint 1
`GROUP BY status` first. The percentage's denominator is the total
across all groups, which an empty `OVER ()` window gives you.

## Hint 2
`round(100.0 * count(*) / sum(count(*)) OVER (), 1) AS pct` - note the
`100.0` so the division is numeric rather than integer.
