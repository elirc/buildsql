SELECT (payload ->> 'value')::int / 100 AS band,
       count(*) AS events,
       count(DISTINCT customer_id) AS customers
FROM events
GROUP BY (payload ->> 'value')::int / 100
ORDER BY band;
