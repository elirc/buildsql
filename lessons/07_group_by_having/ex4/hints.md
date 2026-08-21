## Hint 1
Two grouping keys: the plain `category` column and the whole `CASE`
expression. `count(*)` is the only aggregate.

## Hint 2
`GROUP BY category, tier` (PostgreSQL lets `GROUP BY` reference the
output alias; repeating the full CASE expression is the portable form).
