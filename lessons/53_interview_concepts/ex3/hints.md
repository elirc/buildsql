## Hint 1
Two steps, and doing them in one is the classic mistake. First get one row
per product with its review count; only then pick the best two inside each
category. Which construct numbers rows *within* a group without collapsing
them?

## Hint 2
A CTE that does `GROUP BY p.category, p.id, p.name` with `count(r.id)`,
then a second layer adding `row_number() OVER (PARTITION BY category ORDER
BY reviews DESC, id)`, then `WHERE rn <= 2` in a third. You cannot filter on
a window function in the same `SELECT` that computes it.

## Hint 3
Use `row_number()`, not `rank()`: with `rank()`, a two-way tie for second
place returns three rows for that category and the gate will tell you so.
The `, id` in the `ORDER BY` is the tie-break the prompt demands -- it makes
the answer deterministic instead of "whatever the planner felt like".
