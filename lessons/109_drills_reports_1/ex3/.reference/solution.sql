WITH per_country AS (
  SELECT c.country, count(*) AS orders, sum(o.total) AS revenue
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE o.status <> 'cancelled'
    AND o.created_at >= '2023-10-01'
  GROUP BY c.country),
ranked AS (
  SELECT country, orders, revenue,
         row_number() OVER (ORDER BY revenue DESC, country) AS rn
  FROM per_country)
SELECT country, orders, revenue
FROM ranked
WHERE rn <= 8
ORDER BY revenue DESC, country;
