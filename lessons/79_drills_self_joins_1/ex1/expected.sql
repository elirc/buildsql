SELECT e.id, e.name, e.salary, m.name AS manager
FROM staff e
JOIN staff m ON m.id = e.manager_id
WHERE e.department = 'support'
ORDER BY e.id;
