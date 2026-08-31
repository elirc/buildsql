WITH calendar AS (
  SELECT g::date AS day
  FROM generate_series(DATE '2023-03-01', DATE '2023-03-31', interval '1 day') AS g)
SELECT c.day, count(o.id) AS orders
FROM calendar c
LEFT JOIN orders o ON o.created_at::date = c.day
GROUP BY c.day
ORDER BY c.day;
