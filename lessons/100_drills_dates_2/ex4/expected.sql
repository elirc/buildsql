SELECT date_trunc('hour', ts)
         + (floor(extract(minute FROM ts) / 15))::int * interval '15 minutes' AS bucket,
       count(*) AS events
FROM events
WHERE id <= 20000
GROUP BY 1
ORDER BY bucket;
