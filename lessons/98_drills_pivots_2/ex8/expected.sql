WITH grid AS (
  SELECT date_trunc('month', created_at) AS month,
         count(*) FILTER (WHERE status = 'pending') AS pending,
         count(*) FILTER (WHERE status = 'paid') AS paid,
         count(*) FILTER (WHERE status = 'shipped') AS shipped,
         count(*) FILTER (WHERE status = 'cancelled') AS cancelled
  FROM orders
  GROUP BY date_trunc('month', created_at)),
tall AS (
  SELECT g.month, v.status, v.orders
  FROM grid g
  CROSS JOIN LATERAL (VALUES ('pending', g.pending),
                             ('paid', g.paid),
                             ('shipped', g.shipped),
                             ('cancelled', g.cancelled)) AS v(status, orders)),
ranked AS (
  SELECT month, status, orders,
         row_number() OVER (PARTITION BY month
                            ORDER BY orders DESC, status ASC) AS rn
  FROM tall)
SELECT month, status, orders
FROM ranked
WHERE rn = 1
ORDER BY month;
