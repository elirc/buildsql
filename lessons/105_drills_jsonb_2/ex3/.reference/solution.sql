SELECT count(*) AS hits
FROM events
WHERE (payload ->> 'value')::int = 1000;
