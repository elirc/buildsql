SELECT c.country, sum(oi.quantity * oi.price)
FROM order_items oi
JOIN products p ON p.id = oi.product_id AND p.category = 'books'
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE o.status <> 'cancelled'
  AND o.created_at >= '2023-10-01'
GROUP BY c.country
ORDER BY 2 DESC, 1;
