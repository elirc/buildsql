SELECT id, ts
FROM events
WHERE customer_id = 777
  AND ts >= '2023-11-01';
