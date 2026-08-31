SELECT d.department, t.name, t.salary
FROM (SELECT department, count(*) AS n
      FROM staff
      GROUP BY department) d
CROSS JOIN LATERAL (
  SELECT s.name, s.salary
  FROM staff s
  WHERE s.department = d.department
  ORDER BY s.salary DESC, s.id ASC
  OFFSET (d.n + 1) / 2 - 1
  LIMIT 1) t
ORDER BY d.department;
