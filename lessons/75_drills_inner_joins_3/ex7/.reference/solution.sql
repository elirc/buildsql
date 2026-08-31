SELECT p.id, p.name, r.id, r.created_at
FROM products p
JOIN reviews r ON r.product_id = p.id
WHERE r.rating = 1
  AND p.id IN (SELECT oi.product_id
               FROM orders o
               JOIN order_items oi ON oi.order_id = o.id
               WHERE o.customer_id = 17)
ORDER BY p.id, r.id;
