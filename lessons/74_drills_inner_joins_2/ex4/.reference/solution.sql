SELECT p.category,
       count(DISTINCT o.customer_id) AS buyers,
       count(oi.id) AS lines
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= '2023-10-01'
  AND o.created_at < '2023-11-01'
GROUP BY p.category
ORDER BY p.category;
