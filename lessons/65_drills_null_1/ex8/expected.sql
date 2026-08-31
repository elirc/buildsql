SELECT id, name, manager_id, salary
FROM staff
WHERE (manager_id > 5 AND salary > 100000) IS NOT TRUE
ORDER BY id;
