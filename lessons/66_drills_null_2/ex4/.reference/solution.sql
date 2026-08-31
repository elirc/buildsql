SELECT department,
       count(*) AS headcount,
       count(*) FILTER (WHERE salary >= 190000) AS principals,
       CASE WHEN count(*) FILTER (WHERE salary >= 190000) = 0 THEN NULL
            ELSE round(count(*)::numeric
                       / count(*) FILTER (WHERE salary >= 190000), 2)
       END AS staff_per_principal
FROM staff
GROUP BY department
ORDER BY department;
