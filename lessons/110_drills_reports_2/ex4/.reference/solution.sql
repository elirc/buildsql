WITH bounds AS (
  SELECT date_trunc('day', max(ts)) AS last_day
  FROM events),
windowed AS (
  SELECT date_trunc('day', ts) AS day, event_type
  FROM events, bounds
  WHERE ts >= last_day - interval '2 days'
    AND ts <  last_day + interval '1 day')
SELECT day,
       sum(CASE WHEN event_type = 'view'        THEN 1 ELSE 0 END) AS views,
       sum(CASE WHEN event_type = 'click'       THEN 1 ELSE 0 END) AS clicks,
       sum(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS carts,
       sum(CASE WHEN event_type = 'purchase'    THEN 1 ELSE 0 END) AS purchases,
       sum(CASE WHEN event_type = 'logout'      THEN 1 ELSE 0 END) AS logouts
FROM windowed
GROUP BY day
ORDER BY day;
