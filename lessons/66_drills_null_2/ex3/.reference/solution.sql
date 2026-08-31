SELECT id, name, manager_id
FROM staff
WHERE NOT (manager_id IS DISTINCT FROM (SELECT manager_id FROM staff WHERE id = 1))
ORDER BY id;
