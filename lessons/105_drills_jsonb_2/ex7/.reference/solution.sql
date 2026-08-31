WITH v AS (
  SELECT substr(payload ->> 'path', 4)::int AS pid
  FROM events
  WHERE event_type = 'view')
SELECT v.pid AS product_id, p.name, count(*) AS views
FROM v
JOIN products p ON p.id = v.pid
GROUP BY v.pid, p.name
ORDER BY views DESC, product_id ASC
LIMIT 10;
