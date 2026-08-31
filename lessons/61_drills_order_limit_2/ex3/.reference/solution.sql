SELECT s.id, s.name, s.manager_id
FROM staff AS s
ORDER BY (s.manager_id IS NULL), s.manager_id DESC, s.id
LIMIT 12;
