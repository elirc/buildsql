WITH gaps AS (
  SELECT customer_id,
         ts - lag(ts) OVER (PARTITION BY customer_id ORDER BY ts, id) AS gap
  FROM events
  WHERE customer_id <= 5)
SELECT customer_id,
       count(*) AS events,
       sum(CASE WHEN gap IS NULL OR gap > interval '30 minutes' THEN 1 ELSE 0 END) AS sessions
FROM gaps
GROUP BY 1
ORDER BY 1;
