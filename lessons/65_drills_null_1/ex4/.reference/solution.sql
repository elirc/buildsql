SELECT id, name, manager_id
FROM staff
ORDER BY (manager_id IS NULL), manager_id DESC, id;
