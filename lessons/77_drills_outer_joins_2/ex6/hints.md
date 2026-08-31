## Hint 1
You need two numbers per category, and one of them is about products that have no order lines at all. Joining `products` straight to `order_items` would give you one row per order line and a count of lines, not of products.

## Hint 2
Reduce the right side to one row per product **before** you join it - `SELECT DISTINCT product_id FROM order_items` is enough. Then the outer join is one-to-one, `count(*)` counts products, and `s.product_id IS NULL` marks the ones that never sold.
