SELECT c.country, sum(oi.quantity * oi.price) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE p.category = 'books'
  AND o.status <> 'cancelled'
  AND o.created_at >= '2023-10-01'
GROUP BY c.country
ORDER BY revenue DESC, c.country;
