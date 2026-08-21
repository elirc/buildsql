INSERT INTO inventory (product_id, stock)
VALUES (70, 80), (80, 120), (250, 5)
ON CONFLICT (product_id) DO UPDATE
  SET stock = EXCLUDED.stock
  WHERE EXCLUDED.stock > inventory.stock;
