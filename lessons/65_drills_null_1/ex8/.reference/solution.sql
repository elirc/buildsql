SELECT id, name, manager_id, salary
FROM staff
WHERE NOT (manager_id > 5 AND salary > 100000)
   OR manager_id IS NULL
ORDER BY id;
