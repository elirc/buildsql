WITH per_order AS (
  SELECT o.id, count(oi.id) AS items
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.id <= 5000
  GROUP BY o.id)
SELECT round(avg(items), 4) AS avg_items,
       max(items) AS max_items,
       count(*) FILTER (WHERE items = 0) AS empty_orders
FROM per_order;
