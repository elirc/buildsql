SELECT id,
       regexp_replace(name, '^(\S+) (\S+) ([0-9]+)$', '\1') AS adjective,
       regexp_replace(name, '^(\S+) (\S+) ([0-9]+)$', '\2') AS noun,
       regexp_replace(name, '^(\S+) (\S+) ([0-9]+)$', '\3')::int AS tag
FROM products
WHERE id <= 20
ORDER BY 1;
