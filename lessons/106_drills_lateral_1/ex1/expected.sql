SELECT d.department, t.name, t.hired_on
FROM (SELECT DISTINCT department FROM staff) d
CROSS JOIN LATERAL (
  SELECT s.name, s.hired_on, s.id
  FROM staff s
  WHERE s.department = d.department
  ORDER BY s.hired_on DESC, s.id ASC
  LIMIT 3) t
ORDER BY d.department, t.hired_on DESC, t.id;
