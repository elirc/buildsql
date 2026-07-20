SELECT count(*) AS first_week_orders
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.created_at >= c.created_at
  AND o.created_at < c.created_at + interval '7 days';
