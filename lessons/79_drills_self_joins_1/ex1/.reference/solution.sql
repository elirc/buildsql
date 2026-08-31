SELECT e.id, e.name, e.salary, m.name
FROM staff m
JOIN staff e ON e.manager_id = m.id
WHERE e.department = 'support'
ORDER BY e.id;
