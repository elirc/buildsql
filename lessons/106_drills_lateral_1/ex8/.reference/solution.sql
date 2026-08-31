WITH per_customer AS (
  SELECT customer_id, sum(total) AS revenue
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY customer_id),
top5 AS (
  SELECT customer_id, revenue
  FROM per_customer
  ORDER BY revenue DESC, customer_id
  LIMIT 5),
latest AS (
  SELECT DISTINCT ON (customer_id)
         customer_id, id AS last_order_id, created_at AS last_created_at
  FROM orders
  WHERE status <> 'cancelled'
  ORDER BY customer_id, created_at DESC, id DESC)
SELECT t.customer_id, t.revenue, l.last_order_id, l.last_created_at
FROM top5 t
JOIN latest l USING (customer_id)
ORDER BY t.revenue DESC, t.customer_id;
