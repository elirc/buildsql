SELECT ts::date, count(*) FROM events
WHERE event_type = 'purchase'
  AND ts >= '2023-11-08' AND ts < '2023-11-15'
GROUP BY 1 ORDER BY 1;
