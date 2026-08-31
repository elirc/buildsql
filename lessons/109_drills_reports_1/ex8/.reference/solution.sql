WITH lifetime AS (
  SELECT customer_id,
         sum(total) AS revenue,
         max(created_at) AS last_order_at
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY customer_id)
SELECT l.customer_id, c.name, l.revenue, l.last_order_at
FROM lifetime l
JOIN customers c ON c.id = l.customer_id
WHERE l.last_order_at < '2023-09-01'
ORDER BY l.revenue DESC, l.customer_id ASC
LIMIT 10;
