SELECT id, name, manager_id, NOT (manager_id IS NULL) AS has_manager
FROM staff
WHERE id <= 20
ORDER BY id;
