SELECT s.id, s.name, s.department
FROM staff s
WHERE EXISTS (SELECT 1 FROM staff r
              WHERE r.manager_id = s.id
                AND EXISTS (SELECT 1 FROM staff g WHERE g.manager_id = r.id))
ORDER BY s.id;
