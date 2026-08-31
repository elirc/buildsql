WITH wk AS (
  SELECT date_trunc('week', o.created_at) AS week,
         oi.product_id,
         sum(oi.quantity) AS units
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.created_at >= '2023-10-01' AND o.created_at < '2023-11-01'
  GROUP BY date_trunc('week', o.created_at), oi.product_id)
SELECT DISTINCT ON (week)
       week, w.product_id, p.name, w.units
FROM wk w
JOIN products p ON p.id = w.product_id
ORDER BY week, w.units DESC, w.product_id ASC;
