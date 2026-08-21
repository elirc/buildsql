SELECT id, name, manager_id
FROM staff
ORDER BY manager_id ASC NULLS FIRST, id ASC
LIMIT 10;
