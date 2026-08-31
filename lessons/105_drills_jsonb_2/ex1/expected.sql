SELECT id, payload ->> 'path' AS path
FROM events
WHERE id <= 15
ORDER BY id;
