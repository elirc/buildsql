WITH bounds AS (
  SELECT date_trunc('day', max(ts)) AS last_day
  FROM events)
SELECT date_trunc('day', e.ts) AS day,
       count(*) FILTER (WHERE e.event_type = 'view')        AS views,
       count(*) FILTER (WHERE e.event_type = 'click')       AS clicks,
       count(*) FILTER (WHERE e.event_type = 'add_to_cart') AS carts,
       count(*) FILTER (WHERE e.event_type = 'purchase')    AS purchases,
       count(*) FILTER (WHERE e.event_type = 'logout')      AS logouts
FROM events e, bounds b
WHERE e.ts >= b.last_day - interval '2 days'
  AND e.ts <  b.last_day + interval '1 day'
GROUP BY date_trunc('day', e.ts)
ORDER BY day;
