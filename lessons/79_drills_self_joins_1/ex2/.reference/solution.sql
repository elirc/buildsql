SELECT a.id, a.name, b.id, b.name
FROM staff a, staff b
WHERE a.manager_id = b.manager_id
  AND a.id < b.id
  AND a.department = 'engineering'
ORDER BY a.id, b.id;
