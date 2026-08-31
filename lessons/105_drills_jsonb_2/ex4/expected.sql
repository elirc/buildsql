SELECT event_type,
       round(avg((payload ->> 'value')::int), 1) AS avg_value
FROM events
GROUP BY event_type
ORDER BY event_type;
