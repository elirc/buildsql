(SELECT r.product_id
 FROM reviews r
 WHERE r.rating = 1 AND r.created_at >= '2023-11-01'
 UNION
 SELECT oi.product_id
 FROM order_items oi
 JOIN orders o ON o.id = oi.order_id
 WHERE oi.quantity = 5 AND o.created_at >= '2023-11-01')
INTERSECT
SELECT p.id FROM products p WHERE p.category = 'toys'
ORDER BY 1;
