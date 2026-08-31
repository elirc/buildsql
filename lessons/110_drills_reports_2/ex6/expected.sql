WITH breadth AS (
  SELECT customer_id, count(DISTINCT event_type) AS types
  FROM events
  GROUP BY customer_id)
SELECT types, count(*) AS customers
FROM breadth
GROUP BY types
ORDER BY types;
