WITH base AS (
  SELECT p.category, o.status, oi.quantity * oi.price AS line_rev
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status IN ('paid', 'shipped')),
tot AS (
  SELECT sum(line_rev) AS grand
  FROM base),
g AS (
  SELECT category, status, sum(line_rev) AS revenue
  FROM base
  GROUP BY GROUPING SETS ((category), (status), ()))
SELECT g.category, g.status, g.revenue,
       round(100.0 * g.revenue / t.grand, 1) AS pct_of_total
FROM g
CROSS JOIN tot t
ORDER BY g.category, g.status;
