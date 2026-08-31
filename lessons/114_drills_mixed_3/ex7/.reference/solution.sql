WITH months AS (
  SELECT DISTINCT customer_id, date_trunc('month', created_at) AS m
  FROM orders)
SELECT count(DISTINCT m1.customer_id) AS streak_customers
FROM months m1
JOIN months m2 ON m2.customer_id = m1.customer_id
              AND m2.m = m1.m + interval '1 month'
JOIN months m3 ON m3.customer_id = m1.customer_id
              AND m3.m = m1.m + interval '2 months'
;
