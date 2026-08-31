SELECT p.id, p.name
FROM products p
WHERE p.category = 'garden' AND p.price > 480
  AND NOT EXISTS (SELECT 1
                  FROM order_items oi
                  JOIN orders o ON o.id = oi.order_id
                  WHERE oi.product_id = p.id
                    AND oi.quantity = 5
                    AND o.created_at >= '2023-11-01')
ORDER BY p.id;
