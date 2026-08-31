WITH spend AS (
  SELECT customer_id, sum(total) AS revenue
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY customer_id),
top5 AS (
  SELECT customer_id, revenue
  FROM spend
  ORDER BY revenue DESC, customer_id ASC
  LIMIT 5),
units AS (
  SELECT o.customer_id, p.category, sum(oi.quantity) AS units
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status <> 'cancelled'
    AND o.customer_id IN (SELECT customer_id FROM top5)
  GROUP BY o.customer_id, p.category),
fav AS (
  SELECT DISTINCT ON (customer_id)
         customer_id, category AS fav_category
  FROM units
  ORDER BY customer_id, units DESC, category ASC)
SELECT t.customer_id, t.revenue, f.fav_category
FROM top5 t
JOIN fav f USING (customer_id)
ORDER BY t.revenue DESC, t.customer_id ASC;
