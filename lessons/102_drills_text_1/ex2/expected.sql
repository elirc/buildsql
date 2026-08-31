SELECT id, name,
       initcap(lower(name)) AS pretty,
       rpad(name, 30, '.') AS padded
FROM staff
WHERE id <= 20
ORDER BY id;
