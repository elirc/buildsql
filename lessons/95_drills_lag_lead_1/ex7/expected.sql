WITH gaps AS (
  SELECT customer_id,
         ts - lag(ts) OVER (PARTITION BY customer_id ORDER BY ts) AS gap
  FROM events
  WHERE customer_id <= 5)
SELECT customer_id, max(gap) AS longest_gap
FROM gaps
GROUP BY customer_id
ORDER BY customer_id;
