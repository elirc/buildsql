SELECT department,
       count(*) AS headcount,
       count(CASE WHEN salary >= 100000 THEN 1 END) AS top_earners,
       max(hired_on) < DATE '2022-01-01' AS all_hired_before_2022
FROM staff
GROUP BY 1
ORDER BY 1;
