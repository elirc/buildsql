WITH counts AS (
  SELECT c.country, c.id AS customer_id, count(*) AS orders
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.country, c.id),
ranked AS (
  SELECT country, customer_id, orders,
         row_number() OVER (PARTITION BY country
                            ORDER BY orders DESC, customer_id ASC) AS rn
  FROM counts)
SELECT country, customer_id, orders
FROM ranked
WHERE rn = 1
ORDER BY country;
