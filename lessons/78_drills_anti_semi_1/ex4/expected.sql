SELECT s.id, s.name, s.department
FROM staff s
WHERE NOT EXISTS (SELECT 1 FROM staff r WHERE r.manager_id = s.id)
ORDER BY s.id;
