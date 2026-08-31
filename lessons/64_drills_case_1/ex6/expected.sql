SELECT id, name,
       CASE WHEN manager_id IS NULL THEN 'CEO'
            ELSE 'reports to ' || manager_id::text
       END
FROM staff;
