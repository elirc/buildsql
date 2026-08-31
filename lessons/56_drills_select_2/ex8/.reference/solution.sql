SELECT s.id,
       s.name,
       s.department,
       s.salary,
       s.salary / 12       AS monthly,
       s.salary * 0.15     AS bonus,
       s.salary + s.salary * 0.15 AS package
FROM staff AS s;
