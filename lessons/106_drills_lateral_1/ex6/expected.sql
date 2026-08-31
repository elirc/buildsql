SELECT c.id AS customer_id, t.event_type, t.ts
FROM customers c
CROSS JOIN LATERAL (
  SELECT e.event_type, e.ts
  FROM events e
  WHERE e.customer_id = c.id
  ORDER BY e.ts DESC
  LIMIT 3) t
WHERE c.id <= 5
ORDER BY c.id, t.ts DESC;
