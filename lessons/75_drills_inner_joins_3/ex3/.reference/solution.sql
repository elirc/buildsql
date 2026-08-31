SELECT p.category, sum(oi.quantity), sum(oi.quantity * oi.price)
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.created_at >= DATE '2023-10-01'
  AND o.created_at <  DATE '2023-11-01'
GROUP BY 1
ORDER BY 1;
