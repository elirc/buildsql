WITH gaps AS (
  SELECT customer_id, ts,
         lag(ts) OVER (PARTITION BY customer_id ORDER BY ts, id) AS prev_ts
  FROM events
  WHERE customer_id <= 5)
SELECT customer_id,
       count(*) AS events,
       count(*) FILTER (WHERE prev_ts IS NULL
                           OR ts - prev_ts > interval '30 minutes') AS sessions
FROM gaps
GROUP BY customer_id
ORDER BY customer_id;
