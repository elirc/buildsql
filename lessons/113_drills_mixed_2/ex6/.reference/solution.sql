SELECT id, name
FROM products
WHERE (attributes -> 'tags' @> '["eco"]') <> (attributes -> 'tags' @> '["sale"]')
ORDER BY id;
