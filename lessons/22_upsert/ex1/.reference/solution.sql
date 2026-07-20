INSERT INTO inventory (product_id, stock)
VALUES (50, 75), (150, 40)
ON CONFLICT (product_id)
DO UPDATE SET stock = EXCLUDED.stock;
