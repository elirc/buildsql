SELECT department,
       count(*) FILTER (WHERE salary < 60000) AS under_60k,
       count(*) FILTER (WHERE salary >= 60000 AND salary < 100000) AS mid,
       count(*) FILTER (WHERE salary >= 100000) AS over_100k
FROM staff
GROUP BY department;
