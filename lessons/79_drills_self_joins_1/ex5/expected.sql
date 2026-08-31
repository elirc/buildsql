SELECT s.id, s.name, count(t.id) AS richer_colleagues
FROM staff s
LEFT JOIN staff t ON t.department = s.department AND t.salary > s.salary
WHERE s.department = 'sales'
GROUP BY s.id, s.name
ORDER BY s.id;
