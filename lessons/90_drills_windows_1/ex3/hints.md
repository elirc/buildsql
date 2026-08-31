## Hint 1

Number the customers within each country, then keep the first two. Those are two separate steps and PostgreSQL will insist you write them that way.

## Hint 2

`row_number() OVER (PARTITION BY country ORDER BY created_at, id)` inside a subquery or CTE, then `WHERE rn <= 2` in the query that reads it. Window functions are not allowed in `WHERE` at the same level.
