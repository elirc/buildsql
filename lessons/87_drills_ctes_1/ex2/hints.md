## Hint 1

The grand total is not an aggregate of the four grouped rows you are selecting from - it is an aggregate *over* them, asked as a separate question.

## Hint 2

Once `per_status` exists, `(SELECT sum(revenue) FROM per_status)` is a scalar subquery reading the same named result the outer query is scanning. Because the CTE is referenced twice, PostgreSQL computes it once and reads it back.
