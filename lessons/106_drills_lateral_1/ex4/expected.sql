SELECT d.department, t.top3_payroll
FROM (SELECT DISTINCT department FROM staff) d
CROSS JOIN LATERAL (
  SELECT sum(top.salary) AS top3_payroll
  FROM (SELECT s.salary
        FROM staff s
        WHERE s.department = d.department
        ORDER BY s.salary DESC, s.id ASC
        LIMIT 3) top) t
ORDER BY d.department;
