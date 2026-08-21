SELECT id, ts
FROM events
WHERE payload @> '{"value": 999}';
