SELECT id, name, manager_id, manager_id IS NOT NULL AS has_manager
FROM staff
WHERE id <= 20
ORDER BY id;
