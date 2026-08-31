## Hint 1

Three stages: one row per customer, a decile attached to each, then one row per decile.

## Hint 2

`ntile(10) OVER (ORDER BY orders DESC, customer_id)` reading from the per-customer CTE, then `GROUP BY decile` in the final query.

## Hint 3

`revenue` is summed from the customers in the decile, not from `orders` again - the per-customer CTE already carries it, which is why it computes both figures in one pass.
