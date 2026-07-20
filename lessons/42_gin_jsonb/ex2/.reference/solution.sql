SELECT id
FROM events
WHERE payload @> '{"path": "/p/4242"}';
