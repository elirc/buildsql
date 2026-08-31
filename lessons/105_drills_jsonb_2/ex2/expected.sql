SELECT id, split_part(payload ->> 'path', '/', 3)::int AS product_id
FROM events
WHERE id <= 25
ORDER BY id;
