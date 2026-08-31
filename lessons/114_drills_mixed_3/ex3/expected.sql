SELECT p.id, p.name, p.price
FROM products p
WHERE p.category = 'electronics'
  AND p.price > 480
  AND NOT EXISTS (
    SELECT 1
    FROM events e
    WHERE e.event_type = 'view'
      AND e.payload ->> 'path' = '/p/' || p.id
      AND (e.payload ->> 'value')::int >= 999)
ORDER BY p.id;
