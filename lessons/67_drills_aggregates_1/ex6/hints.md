## Hint 1

`count(DISTINCT col)` counts distinct non-NULL values. `SELECT DISTINCT col` would return a row for NULL as well - the two disagree by exactly one here.

## Hint 2

All four numbers come from one pass over the same table, so this is a single `SELECT` with no subqueries and no `GROUP BY`.
