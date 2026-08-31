SELECT id,
       attributes->'tags'->>0 AS first_tag,
       attributes->'tags' AS tags
FROM products
WHERE id <= 20
ORDER BY 1;
