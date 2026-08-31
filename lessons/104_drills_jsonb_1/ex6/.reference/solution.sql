SELECT p.id, to_jsonb(t) AS doc
FROM products p
CROSS JOIN LATERAL (
  SELECT p.name AS name, p.price AS price,
         p.attributes->>'color' AS color) t
WHERE p.id <= 10
ORDER BY 1;
