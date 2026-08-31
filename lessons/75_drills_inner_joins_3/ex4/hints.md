## Hint 1
Four tables, one path: customer -> order -> line -> product. Write the chain down in English before you write any SQL and the joins fall out in order.

## Hint 2
Every hop is an equality between a primary key and the column that points at it: `o.customer_id = c.id`, `oi.order_id = o.id`, `p.id = oi.product_id`. Both product predicates are filters, so they belong in `WHERE`.
