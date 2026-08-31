WITH cohort_customers AS (
  SELECT id, created_at, date_trunc('month', created_at) AS cohort
  FROM customers
  WHERE created_at >= '2023-01-01'),
fast AS (
  SELECT DISTINCT cc.id
  FROM cohort_customers cc
  JOIN orders o ON o.customer_id = cc.id
  WHERE o.created_at < cc.created_at + interval '30 days')
SELECT cc.cohort,
       count(*) AS signups,
       count(f.id) AS fast_buyers,
       round(100.0 * count(f.id) / count(*), 1) AS fast_pct
FROM cohort_customers cc
LEFT JOIN fast f ON f.id = cc.id
GROUP BY cc.cohort
ORDER BY cc.cohort;
