SELECT p.category,
       count(DISTINCT o.customer_id) AS buyers,
       count(*) AS lines
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= DATE '2023-10-01'
  AND o.created_at < DATE '2023-11-01'
GROUP BY p.category
ORDER BY p.category;
