WITH q AS (
  SELECT date_trunc('quarter', created_at) AS quarter
  FROM customers)
SELECT quarter, count(*) AS signups
FROM q
GROUP BY quarter
ORDER BY quarter;
