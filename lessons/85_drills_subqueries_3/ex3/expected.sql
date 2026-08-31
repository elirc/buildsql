SELECT s.id, s.name,
       (SELECT g.name FROM staff g
        WHERE g.id = (SELECT m.manager_id FROM staff m WHERE m.id = s.manager_id))
         AS grand_manager
FROM staff s
WHERE s.department = 'support'
ORDER BY s.id;
