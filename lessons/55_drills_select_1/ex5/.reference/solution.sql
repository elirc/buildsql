SELECT s.department, s.manager_id
FROM staff AS s
GROUP BY s.department, s.manager_id;
