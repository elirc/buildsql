WITH per_customer AS (
  SELECT c.country, o.customer_id, sum(o.total) AS spent
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE o.status <> 'cancelled'
  GROUP BY c.country, o.customer_id)
SELECT country,
       count(*) AS buyers,
       sum(spent) AS revenue,
       round(sum(spent) / count(*), 2) AS per_buyer
FROM per_customer
GROUP BY country
HAVING count(*) >= 100
ORDER BY per_buyer DESC, country ASC;
