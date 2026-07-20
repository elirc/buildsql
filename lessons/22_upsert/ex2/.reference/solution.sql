INSERT INTO inventory (product_id, stock)
VALUES (60, 0), (200, 0)
ON CONFLICT (product_id) DO NOTHING;
