SELECT s.id, s.name, s.salary
FROM staff s
LEFT JOIN staff r ON r.manager_id = s.id
WHERE s.department = 'sales'
GROUP BY s.id, s.name, s.salary
ORDER BY count(r.id) DESC, s.id;
