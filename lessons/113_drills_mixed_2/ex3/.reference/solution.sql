SELECT id, customer_id, (payload ->> 'value')::int AS value
FROM events
WHERE event_type = 'purchase'
  AND payload @> '{"path": "/p/7"}'
ORDER BY id;
