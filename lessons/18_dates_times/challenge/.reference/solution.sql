SELECT extract(hour FROM ts)::int AS hour,
       count(*) AS purchases
FROM events
WHERE event_type = 'purchase'
GROUP BY 1
ORDER BY purchases DESC, hour
LIMIT 3;
