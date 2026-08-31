SELECT split_part(e.payload ->> 'path', '/', 3)::int AS product_id,
       p.name,
       count(*) AS views
FROM events e
JOIN products p ON p.id = split_part(e.payload ->> 'path', '/', 3)::int
WHERE e.event_type = 'view'
GROUP BY 1, p.name
ORDER BY views DESC, product_id ASC
LIMIT 10;
