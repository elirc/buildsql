SELECT to_timestamp(floor(extract(epoch FROM ts) / 900) * 900) AS bucket,
       count(*) AS events
FROM events
WHERE id <= 20000
GROUP BY 1
ORDER BY 1;
