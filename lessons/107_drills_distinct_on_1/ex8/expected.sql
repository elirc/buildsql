SELECT c.id, c.name, e.event_type AS last_event_type, e.ts AS last_ts
FROM customers c
LEFT JOIN (
  SELECT DISTINCT ON (customer_id)
         customer_id, event_type, ts
  FROM events
  ORDER BY customer_id, ts DESC) e
  ON e.customer_id = c.id
WHERE c.id <= 10
ORDER BY c.id;
