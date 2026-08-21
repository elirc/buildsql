SELECT id, ts, event_type
FROM events
WHERE customer_id = 4242
  AND ts > TIMESTAMPTZ '2023-10-20 00:00:00+00'
ORDER BY ts
LIMIT 20;
