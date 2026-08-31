SELECT id, substring(payload ->> 'path' FROM '[0-9]+')::int AS product_id
FROM events
WHERE id <= 25
ORDER BY id;
