SELECT p.id, kv.key, kv.value
FROM products p
CROSS JOIN LATERAL jsonb_each_text(p.attributes) AS kv(key, value)
WHERE p.id <= 10
  AND kv.key <> 'tags'
ORDER BY 1, 2;
