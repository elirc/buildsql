## Hint 1

You cannot write `max(count(*))`. The inner aggregate must be computed by a subquery or CTE whose rows are then aggregated by the outer query.

## Hint 2

Stage it: the inner query joins `reviews` to `products`, keeps the food
category, and groups by the product to produce one row per product with its
review count. The outer query then runs its four aggregates over those rows.
