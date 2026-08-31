WITH firsts AS (
  SELECT c.id,
         extract(year FROM c.created_at)::int AS signup_year,
         min(o.created_at)::date - c.created_at::date AS days_to_first
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id, c.created_at)
SELECT signup_year,
       count(*) AS buyers,
       round(avg(days_to_first), 1) AS avg_days
FROM firsts
GROUP BY signup_year
ORDER BY signup_year;
