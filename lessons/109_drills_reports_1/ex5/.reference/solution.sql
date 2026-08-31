WITH first_orders AS (
  SELECT DISTINCT ON (customer_id)
         customer_id, created_at AS first_at
  FROM orders
  ORDER BY customer_id, created_at ASC, id ASC)
SELECT extract(year FROM c.created_at)::int AS signup_year,
       count(*) AS buyers,
       round(avg(f.first_at::date - c.created_at::date), 1) AS avg_days
FROM first_orders f
JOIN customers c ON c.id = f.customer_id
GROUP BY extract(year FROM c.created_at)::int
ORDER BY signup_year;
