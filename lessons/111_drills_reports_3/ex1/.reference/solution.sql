SELECT count(*) AS events,
       count(DISTINCT customer_id) AS actives,
       sum(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) AS purchases
FROM events
WHERE ts >= (SELECT date_trunc('day', max(ts)) - interval '1 day' FROM events)
  AND ts <  (SELECT date_trunc('day', max(ts)) FROM events);
