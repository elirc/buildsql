WITH d AS (
  SELECT extract(isodow FROM created_at)::int AS dow
  FROM orders)
SELECT dow,
       count(*) AS orders,
       CASE WHEN dow IN (6, 7) THEN true ELSE false END AS is_weekend
FROM d
GROUP BY dow
ORDER BY dow;
