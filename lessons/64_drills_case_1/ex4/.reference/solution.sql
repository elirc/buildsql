SELECT s.id, s.salary,
       CASE WHEN s.salary <= 60000 THEN 'junior'
            WHEN s.salary <= 100000 THEN 'mid'
            ELSE 'senior'
       END AS band
FROM staff AS s;
