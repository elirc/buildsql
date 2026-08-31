SELECT id, name,
       initcap(name) AS pretty,
       substr(name || repeat('.', 30), 1, 30) AS padded
FROM staff
WHERE id <= 20
ORDER BY 1;
