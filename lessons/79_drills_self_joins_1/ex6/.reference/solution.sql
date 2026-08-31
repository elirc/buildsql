SELECT m.id, m.name, m.department, r.reports, r.avg_report_salary
FROM staff m
JOIN (SELECT manager_id,
             count(*) AS reports,
             round(avg(salary), 2) AS avg_report_salary
      FROM staff
      WHERE manager_id IS NOT NULL
      GROUP BY manager_id) r ON r.manager_id = m.id
WHERE r.reports >= 5
ORDER BY r.reports DESC, m.id;
