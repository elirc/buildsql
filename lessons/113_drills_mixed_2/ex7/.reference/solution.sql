WITH firsts AS (
  SELECT DISTINCT ON (customer_id)
         customer_id, total AS first_total
  FROM orders
  WHERE customer_id <= 10
  ORDER BY customer_id, created_at ASC, id ASC),
lasts AS (
  SELECT DISTINCT ON (customer_id)
         customer_id, total AS last_total
  FROM orders
  WHERE customer_id <= 10
  ORDER BY customer_id, created_at DESC, id DESC),
counts AS (
  SELECT customer_id, count(*) AS orders
  FROM orders
  WHERE customer_id <= 10
  GROUP BY customer_id
  HAVING count(*) >= 2)
SELECT c.customer_id, c.orders, f.first_total, l.last_total,
       CASE WHEN l.last_total > f.first_total THEN 'up'
            WHEN l.last_total < f.first_total THEN 'down'
            ELSE 'flat' END AS direction
FROM counts c
JOIN firsts f USING (customer_id)
JOIN lasts l USING (customer_id)
ORDER BY c.customer_id;
