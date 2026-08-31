WITH ranked AS (
  SELECT customer_id, event_type, ts,
         row_number() OVER (PARTITION BY customer_id
                            ORDER BY ts DESC) AS rn
  FROM events
  WHERE customer_id <= 5)
SELECT customer_id, event_type, ts
FROM ranked
WHERE rn <= 3
ORDER BY customer_id, ts DESC;
