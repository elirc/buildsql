SELECT id, name,
       CASE WHEN manager_id IS NULL THEN 'none' ELSE manager_id::text END AS manager
FROM staff
WHERE department = 'ops'
ORDER BY id;
