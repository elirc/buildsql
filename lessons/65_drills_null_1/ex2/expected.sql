SELECT id, name, coalesce(manager_id::text, 'none') AS manager
FROM staff
WHERE department = 'ops'
ORDER BY id;
