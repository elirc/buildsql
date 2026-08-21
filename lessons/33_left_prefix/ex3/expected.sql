SELECT id, ts, payload
FROM events
WHERE customer_id = 4242 AND event_type = 'purchase';
