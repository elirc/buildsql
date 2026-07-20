SELECT id, name
FROM staff
WHERE id NOT IN (SELECT manager_id FROM staff
                 WHERE manager_id IS NOT NULL);
