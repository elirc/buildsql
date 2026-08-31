SELECT DISTINCT ON (event_type)
       event_type, id AS event_id, ts
FROM events
ORDER BY event_type, ts DESC;
