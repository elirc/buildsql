INSERT INTO inventory (product_id, stock)
SELECT id, 50
FROM products
WHERE id BETWEEN 95 AND 105
ON CONFLICT (product_id) DO UPDATE
  SET stock = EXCLUDED.stock;
