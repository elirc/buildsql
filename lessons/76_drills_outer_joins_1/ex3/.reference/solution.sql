SELECT c.id, c.name, o.id, o.total
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'ES' AND c.created_at >= '2023-10-01'
UNION ALL
SELECT c.id, c.name, NULL::int, NULL::numeric
FROM customers c
WHERE c.country = 'ES' AND c.created_at >= '2023-10-01'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
ORDER BY 1, 3 NULLS FIRST;
