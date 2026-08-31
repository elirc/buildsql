SELECT s.id, s.name, s.department
FROM staff s
LEFT JOIN staff r ON r.manager_id = s.id
WHERE r.id IS NULL
ORDER BY s.id;
