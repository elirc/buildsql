WITH pivoted AS (
  SELECT c.country,
         sum(CASE WHEN o.status = 'paid'      THEN 1 ELSE 0 END) AS paid,
         sum(CASE WHEN o.status = 'shipped'   THEN 1 ELSE 0 END) AS shipped,
         sum(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.country)
SELECT country, paid, shipped, cancelled
FROM pivoted
WHERE cancelled > shipped
ORDER BY country;
