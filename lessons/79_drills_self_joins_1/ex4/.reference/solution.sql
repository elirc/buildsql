SELECT e.id, e.name, e.department, m.name, m.department
FROM staff m
JOIN staff e ON e.manager_id = m.id
WHERE e.department IS DISTINCT FROM m.department
ORDER BY e.id;
