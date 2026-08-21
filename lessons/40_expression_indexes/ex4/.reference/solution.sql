SELECT id, ts, customer_id
FROM events
WHERE (payload ->> 'value')::int = 999;
