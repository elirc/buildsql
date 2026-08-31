SELECT s.id, s.name, s.salary
FROM staff s
WHERE s.department = 'sales'
ORDER BY (SELECT count(*) FROM staff r WHERE r.manager_id = s.id) DESC, s.id;
