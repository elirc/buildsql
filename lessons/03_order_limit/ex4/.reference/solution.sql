SELECT id, name, manager_id
FROM staff
ORDER BY manager_id NULLS FIRST, id
LIMIT 10;
