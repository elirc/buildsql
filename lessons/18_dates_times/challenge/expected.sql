SELECT extract(hour FROM ts)::int, count(*) FROM events
WHERE event_type = 'purchase'
GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 3;
