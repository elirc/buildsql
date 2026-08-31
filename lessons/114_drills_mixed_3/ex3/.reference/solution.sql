WITH hot AS (
  SELECT DISTINCT split_part(payload ->> 'path', '/', 3)::int AS pid
  FROM events
  WHERE event_type = 'view'
    AND (payload ->> 'value')::int >= 999)
SELECT p.id, p.name, p.price
FROM products p
LEFT JOIN hot h ON h.pid = p.id
WHERE p.category = 'electronics'
  AND p.price > 480
  AND h.pid IS NULL
ORDER BY p.id;
