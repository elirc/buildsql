SELECT s.id, s.name, s.department
FROM staff s
WHERE NOT EXISTS (SELECT 1 FROM staff m WHERE m.manager_id = s.id);
