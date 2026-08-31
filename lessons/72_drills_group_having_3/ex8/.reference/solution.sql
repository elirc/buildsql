WITH heavy AS (
  SELECT customer_id
  FROM orders
  GROUP BY customer_id
  HAVING count(*) > 15)
SELECT c.country, count(*) AS heavy_buyers
FROM customers c
JOIN heavy h ON h.customer_id = c.id
GROUP BY c.country
ORDER BY c.country;
