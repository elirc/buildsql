## Hint 1

The overall average is one number. Give it a one-row CTE and cross join it in, so every order row carries it.

## Hint 2

PostgreSQL will complain that the cross-joined column "must appear in the GROUP BY clause" - it has no way to know the CTE has a single row. Wrap it in an aggregate: `min(v.avg_total)` is the usual trick.
