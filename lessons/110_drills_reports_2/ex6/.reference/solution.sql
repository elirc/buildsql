WITH pairs AS (
  SELECT DISTINCT customer_id, event_type
  FROM events),
breadth AS (
  SELECT customer_id, count(*) AS types
  FROM pairs
  GROUP BY customer_id)
SELECT types, count(*) AS customers
FROM breadth
GROUP BY types
ORDER BY types;
