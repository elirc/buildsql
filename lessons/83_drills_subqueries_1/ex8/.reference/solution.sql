WITH agg AS (
    SELECT department, count(*) AS staff, avg(salary) AS avg_salary
    FROM staff
    GROUP BY department
), top AS (
    SELECT DISTINCT ON (department) department, name
    FROM staff
    ORDER BY department, salary DESC, id
)
SELECT agg.department, agg.staff, top.name AS top_earner
FROM agg
JOIN top ON top.department = agg.department
WHERE agg.avg_salary > (SELECT avg(salary) FROM staff)
ORDER BY agg.department;
