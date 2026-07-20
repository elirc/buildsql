SELECT id, name
FROM staff
WHERE department = 'finance'
  AND manager_id IS NOT NULL;
