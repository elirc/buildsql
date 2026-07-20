## Hint 1
Same anti-join skeleton as ex1, different pair of tables: products on the
left, order_items on the right, joined on the product id.

## Hint 2
`FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE
oi.id IS NULL` — select `p.id, p.name`.
