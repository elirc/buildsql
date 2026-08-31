WITH bounds AS (
  SELECT date_trunc('day', max(ts)) AS last_day
  FROM events)
SELECT count(*) AS events,
       count(DISTINCT e.customer_id) AS actives,
       count(*) FILTER (WHERE e.event_type = 'purchase') AS purchases
FROM events e, bounds b
WHERE e.ts >= b.last_day - interval '1 day'
  AND e.ts <  b.last_day;
