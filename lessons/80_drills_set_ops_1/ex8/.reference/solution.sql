SELECT p.id
FROM products p
WHERE p.category = 'toys'
  AND (EXISTS (SELECT 1 FROM reviews r
               WHERE r.product_id = p.id AND r.rating = 1
                 AND r.created_at >= DATE '2023-11-01')
       OR EXISTS (SELECT 1
                  FROM order_items oi
                  JOIN orders o ON o.id = oi.order_id
                  WHERE oi.product_id = p.id
                    AND oi.quantity = 5
                    AND o.created_at >= DATE '2023-11-01'))
ORDER BY p.id;
