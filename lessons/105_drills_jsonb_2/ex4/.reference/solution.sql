WITH vals AS (
  SELECT event_type, (payload ->> 'value')::int AS v
  FROM events)
SELECT event_type, round(avg(v), 1) AS avg_value
FROM vals
GROUP BY event_type
ORDER BY event_type;
