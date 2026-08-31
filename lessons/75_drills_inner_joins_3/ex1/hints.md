## Hint 1
The buyer lives in `orders`, the thing bought lives in `products`, and `order_items` is the only table that knows which product belongs to which order. Three tables, two join conditions.

## Hint 2
Chain them: `orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id`. The customer filter belongs in `WHERE`, not in either `ON` clause - it is not a join key.
