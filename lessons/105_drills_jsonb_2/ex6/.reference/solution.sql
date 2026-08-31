WITH v AS (
  SELECT (payload ->> 'value')::int / 100 AS band, customer_id
  FROM events)
SELECT band,
       count(*) AS events,
       count(DISTINCT customer_id) AS customers
FROM v
GROUP BY band
ORDER BY band;
