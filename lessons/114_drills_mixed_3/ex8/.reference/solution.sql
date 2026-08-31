WITH v AS (
  SELECT split_part(payload ->> 'path', '/', 3)::int AS pid, count(*) AS views
  FROM events
  WHERE event_type = 'view'
  GROUP BY split_part(payload ->> 'path', '/', 3)::int),
b AS (
  SELECT split_part(payload ->> 'path', '/', 3)::int AS pid, count(*) AS purchases
  FROM events
  WHERE event_type = 'purchase'
  GROUP BY split_part(payload ->> 'path', '/', 3)::int)
SELECT v.pid AS product_id, p.name, p.category, v.views,
       COALESCE(b.purchases, 0) AS purchases,
       round(100.0 * COALESCE(b.purchases, 0) / NULLIF(v.views, 0), 1) AS conv_pct
FROM v
LEFT JOIN b ON b.pid = v.pid
JOIN products p ON p.id = v.pid
ORDER BY v.views DESC, product_id ASC
LIMIT 10;
