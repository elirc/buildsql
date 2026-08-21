## Hint 1
Replace the `VALUES` list with a `SELECT` that produces the same two
columns: `SELECT id, 50 FROM products WHERE id BETWEEN 95 AND 105`.

## Hint 2
`INSERT INTO inventory (product_id, stock) SELECT id, 50 FROM products WHERE id BETWEEN 95 AND 105 ON CONFLICT (product_id) DO UPDATE SET stock = EXCLUDED.stock;`
