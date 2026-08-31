WITH spenders AS (
  SELECT customer_id, sum(total) AS revenue
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY customer_id
  ORDER BY revenue DESC, customer_id
  LIMIT 5)
SELECT s.customer_id, s.revenue, t.last_order_id, t.last_created_at
FROM spenders s
CROSS JOIN LATERAL (
  SELECT o.id AS last_order_id, o.created_at AS last_created_at
  FROM orders o
  WHERE o.customer_id = s.customer_id
    AND o.status <> 'cancelled'
  ORDER BY o.created_at DESC, o.id DESC
  LIMIT 1) t
ORDER BY s.revenue DESC, s.customer_id;
