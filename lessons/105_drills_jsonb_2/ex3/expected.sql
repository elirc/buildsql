SELECT count(*) AS hits
FROM events
WHERE payload @> '{"value": 1000}';
