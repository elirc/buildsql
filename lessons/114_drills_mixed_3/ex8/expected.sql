WITH stats AS (
  SELECT split_part(payload ->> 'path', '/', 3)::int AS product_id,
         count(*) FILTER (WHERE event_type = 'view')     AS views,
         count(*) FILTER (WHERE event_type = 'purchase') AS purchases
  FROM events
  WHERE event_type IN ('view', 'purchase')
  GROUP BY split_part(payload ->> 'path', '/', 3)::int)
SELECT s.product_id, p.name, p.category, s.views, s.purchases,
       round(100.0 * s.purchases / NULLIF(s.views, 0), 1) AS conv_pct
FROM stats s
JOIN products p ON p.id = s.product_id
ORDER BY s.views DESC, s.product_id ASC
LIMIT 10;
