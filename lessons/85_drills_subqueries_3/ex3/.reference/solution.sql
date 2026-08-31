SELECT s.id, s.name, g.name AS grand_manager
FROM staff s
LEFT JOIN staff m ON m.id = s.manager_id
LEFT JOIN staff g ON g.id = m.manager_id
WHERE s.department = 'support'
ORDER BY s.id;
