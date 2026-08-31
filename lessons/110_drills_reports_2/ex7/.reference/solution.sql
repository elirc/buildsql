WITH counts AS (
  SELECT customer_id, count(*) AS orders
  FROM orders
  GROUP BY customer_id)
SELECT date_trunc('quarter', c.created_at) AS cohort,
       count(*) AS buyers,
       sum(CASE WHEN n.orders >= 12 THEN 1 ELSE 0 END) AS heavy,
       round(100.0 * sum(CASE WHEN n.orders >= 12 THEN 1 ELSE 0 END) / count(*), 1) AS heavy_pct
FROM customers c
JOIN counts n ON n.customer_id = c.id
WHERE c.created_at >= '2023-01-01'
GROUP BY date_trunc('quarter', c.created_at)
ORDER BY cohort;
