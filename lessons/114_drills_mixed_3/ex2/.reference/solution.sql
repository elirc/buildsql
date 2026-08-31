WITH wk AS (
  SELECT date_trunc('week', o.created_at) AS week,
         oi.product_id,
         sum(oi.quantity) AS units
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.created_at >= '2023-10-01' AND o.created_at < '2023-11-01'
  GROUP BY date_trunc('week', o.created_at), oi.product_id),
ranked AS (
  SELECT week, product_id, units,
         row_number() OVER (PARTITION BY week
                            ORDER BY units DESC, product_id ASC) AS rn
  FROM wk)
SELECT r.week, r.product_id, p.name, r.units
FROM ranked r
JOIN products p ON p.id = r.product_id
WHERE r.rn = 1
ORDER BY r.week;
