SELECT s.id, s.name
FROM staff s
WHERE NOT EXISTS (SELECT 1 FROM staff o
                  WHERE o.department = 'ops' AND o.manager_id = s.id)
ORDER BY s.id;
