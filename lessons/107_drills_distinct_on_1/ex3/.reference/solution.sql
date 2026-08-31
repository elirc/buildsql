WITH ranked AS (
  SELECT event_type, id, ts,
         row_number() OVER (PARTITION BY event_type
                            ORDER BY ts DESC) AS rn
  FROM events)
SELECT event_type, id AS event_id, ts
FROM ranked
WHERE rn = 1
ORDER BY event_type;
