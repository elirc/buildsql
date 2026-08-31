WITH firsts AS (
  SELECT customer_id, min(created_at) AS first_order
  FROM orders
  GROUP BY customer_id)
SELECT date_trunc('month', c.created_at) AS cohort,
       count(*) AS signups,
       count(*) FILTER (WHERE f.first_order < c.created_at + interval '30 days') AS fast_buyers,
       round(100.0 * count(*) FILTER (WHERE f.first_order < c.created_at + interval '30 days')
             / count(*), 1) AS fast_pct
FROM customers c
LEFT JOIN firsts f ON f.customer_id = c.id
WHERE c.created_at >= '2023-01-01'
GROUP BY date_trunc('month', c.created_at)
ORDER BY cohort;
