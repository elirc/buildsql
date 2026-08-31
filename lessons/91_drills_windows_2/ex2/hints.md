## Hint 1

One row per order, with per-customer figures attached. A `GROUP BY customer_id` would destroy exactly the rows you need to keep.

## Hint 2

`count(*) OVER (PARTITION BY customer_id)` and `sum(total) OVER (PARTITION BY customer_id)`, with `WHERE customer_id <= 15` restricting the input.
