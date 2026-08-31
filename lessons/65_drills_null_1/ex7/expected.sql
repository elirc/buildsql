SELECT id, name
FROM staff
WHERE id NOT IN (SELECT manager_id FROM staff
                 WHERE department = 'ops' AND manager_id IS NOT NULL)
ORDER BY id;
