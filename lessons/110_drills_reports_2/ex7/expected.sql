WITH per_customer AS (
  SELECT c.id,
         date_trunc('quarter', c.created_at) AS cohort,
         count(o.id) AS orders
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  WHERE c.created_at >= '2023-01-01'
  GROUP BY c.id, date_trunc('quarter', c.created_at))
SELECT cohort,
       count(*) AS buyers,
       count(*) FILTER (WHERE orders >= 12) AS heavy,
       round(100.0 * count(*) FILTER (WHERE orders >= 12) / count(*), 1) AS heavy_pct
FROM per_customer
GROUP BY cohort
ORDER BY cohort;
