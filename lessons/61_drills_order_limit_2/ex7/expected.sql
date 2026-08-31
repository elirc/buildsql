SELECT id, name, manager_id, salary
FROM staff
ORDER BY manager_id ASC NULLS LAST, salary DESC, id ASC
LIMIT 20;
