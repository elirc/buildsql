## Hint 1

Three steps: revenue per product, then two windows over the category partition, then keep one row per category.

## Hint 2

`sum(revenue) OVER (PARTITION BY category)` gives the denominator; `row_number() OVER (PARTITION BY category ORDER BY revenue DESC, product_id)` picks the leader. Both belong in the same CTE.

## Hint 3

The `WHERE rn = 1` has to be in a query one level above the windows, and the percentage divides the raw `revenue` by the raw `category_revenue` before rounding to 3.
