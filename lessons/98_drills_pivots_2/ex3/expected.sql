SELECT department,
       count(*) AS headcount,
       count(*) FILTER (WHERE salary >= 100000) AS top_earners,
       count(*) FILTER (WHERE hired_on >= DATE '2022-01-01') = 0 AS all_hired_before_2022
FROM staff
GROUP BY department
ORDER BY department;
