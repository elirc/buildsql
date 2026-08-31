SELECT id, name, manager_id
FROM staff
WHERE manager_id IS NOT DISTINCT FROM (SELECT manager_id FROM staff WHERE id = 1)
ORDER BY id;
