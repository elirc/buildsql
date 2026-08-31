SELECT s.id, s.name, s.department, s.salary
FROM staff s
WHERE s.id NOT IN (SELECT r.manager_id FROM staff r
                   WHERE r.manager_id IS NOT NULL)
ORDER BY s.id;
