SELECT s.id, s.name,
       count(r.id) AS reports,
       coalesce(sum(r.salary), 0) AS report_payroll
FROM staff s
LEFT JOIN staff r ON r.manager_id = s.id
WHERE s.salary < 100000
GROUP BY s.id, s.name
ORDER BY s.id;
