WITH months AS (
  SELECT DISTINCT customer_id, date_trunc('month', created_at) AS m
  FROM orders),
numbered AS (
  SELECT customer_id, m,
         row_number() OVER (PARTITION BY customer_id ORDER BY m) AS rn
  FROM months),
islands AS (
  SELECT customer_id, m - (rn * interval '1 month') AS anchor
  FROM numbered)
SELECT count(DISTINCT customer_id) AS streak_customers
FROM (
  SELECT customer_id
  FROM islands
  GROUP BY customer_id, anchor
  HAVING count(*) >= 3) s;
