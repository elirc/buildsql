## Hint 1

Two steps in one query: keep only the customers with no matching order, then count what is left, grouped by country.

## Hint 2

`WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)` narrows the rows first; `GROUP BY c.country` with `count(*)` does the rest. The filter runs before the grouping, so `count(*)` already means "never-ordered customers here".
