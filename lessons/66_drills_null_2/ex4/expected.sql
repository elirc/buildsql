SELECT department,
       count(*) AS headcount,
       count(*) FILTER (WHERE salary >= 190000) AS principals,
       round(count(*)::numeric
             / nullif(count(*) FILTER (WHERE salary >= 190000), 0), 2) AS staff_per_principal
FROM staff
GROUP BY department
ORDER BY department;
