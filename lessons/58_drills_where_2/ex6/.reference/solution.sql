SELECT s.id, s.name, s.department
FROM staff AS s
WHERE s.department <> 'sales'
  AND s.department <> 'support';
