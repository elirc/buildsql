SELECT id, name, manager_id
FROM staff
ORDER BY manager_id DESC NULLS LAST, id ASC
LIMIT 12;
