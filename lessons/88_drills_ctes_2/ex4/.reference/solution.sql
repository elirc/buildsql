SELECT DISTINCT r.product_id
FROM reviews r
WHERE NOT EXISTS (SELECT 1 FROM order_items oi
                  WHERE oi.product_id = r.product_id)
ORDER BY r.product_id;
