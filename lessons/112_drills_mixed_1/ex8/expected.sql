WITH spend AS (
  SELECT customer_id, sum(total) AS revenue
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY customer_id
  ORDER BY revenue DESC, customer_id ASC
  LIMIT 5)
SELECT s.customer_id, s.revenue, f.fav_category
FROM spend s
CROSS JOIN LATERAL (
  SELECT p.category AS fav_category
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.customer_id = s.customer_id
    AND o.status <> 'cancelled'
  GROUP BY p.category
  ORDER BY sum(oi.quantity) DESC, p.category ASC
  LIMIT 1) f
ORDER BY s.revenue DESC, s.customer_id ASC;
