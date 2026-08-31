SELECT c.id, c.name, t.event_type AS last_event_type, t.ts AS last_ts
FROM customers c
LEFT JOIN LATERAL (
  SELECT e.event_type, e.ts
  FROM events e
  WHERE e.customer_id = c.id
  ORDER BY e.ts DESC
  LIMIT 1) t ON true
WHERE c.id <= 10
ORDER BY c.id;
