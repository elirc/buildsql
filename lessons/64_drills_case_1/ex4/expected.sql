SELECT id, salary,
       CASE WHEN salary > 100000 THEN 'senior'
            WHEN salary > 60000 THEN 'mid'
            ELSE 'junior'
       END
FROM staff;
