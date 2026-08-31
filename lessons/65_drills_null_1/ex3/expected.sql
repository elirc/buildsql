SELECT id,
       name || ' -> ' || manager_id AS piped,
       concat(name, ' -> ', manager_id) AS joined
FROM staff
WHERE id <= 12
ORDER BY id;
