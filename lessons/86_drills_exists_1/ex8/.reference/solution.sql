SELECT DISTINCT s.id, s.name, s.department
FROM staff s
JOIN staff r ON r.manager_id = s.id
JOIN staff g ON g.manager_id = r.id
ORDER BY s.id;
