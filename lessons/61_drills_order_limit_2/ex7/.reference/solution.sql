SELECT s.id, s.name, s.manager_id, s.salary
FROM staff AS s
ORDER BY (s.manager_id IS NULL) ASC, s.manager_id ASC, s.salary DESC, s.id ASC
LIMIT 20;
