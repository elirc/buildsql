SELECT p.id, kv.key, kv.value
FROM products p
CROSS JOIN LATERAL jsonb_each_text(p.attributes - 'tags') AS kv(key, value)
WHERE p.id <= 10
ORDER BY p.id, kv.key;
