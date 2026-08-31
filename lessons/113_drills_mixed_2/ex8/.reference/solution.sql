WITH base AS (
  SELECT p.category, o.status, oi.quantity * oi.price AS line_rev
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status IN ('paid', 'shipped')),
g AS (
  SELECT category, NULL::text AS status, sum(line_rev) AS revenue
  FROM base
  GROUP BY category
  UNION ALL
  SELECT NULL::text, status, sum(line_rev)
  FROM base
  GROUP BY status
  UNION ALL
  SELECT NULL::text, NULL::text, sum(line_rev)
  FROM base)
SELECT category, status, revenue,
       round(100.0 * revenue / (SELECT sum(line_rev) FROM base), 1) AS pct_of_total
FROM g
ORDER BY category, status;
