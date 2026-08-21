## Hint 1
Exercise 1's statement with a `WHERE` attached to the `DO UPDATE`.
Inside it, `EXCLUDED.stock` is the proposed value and `inventory.stock`
is what is already there.

## Hint 2
`... ON CONFLICT (product_id) DO UPDATE SET stock = EXCLUDED.stock WHERE EXCLUDED.stock > inventory.stock;`
