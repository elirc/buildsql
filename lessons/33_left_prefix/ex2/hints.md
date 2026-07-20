## Hint 1
The provided `(order_id, product_id)` index is sorted by order first -
useless for product-alone. Add a second index with `product_id` in the
leading (only) position. Keep the provided one.

## Hint 2
Append: `CREATE INDEX order_items_product_id_idx ON order_items (product_id);`
