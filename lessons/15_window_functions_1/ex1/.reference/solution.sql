SELECT name, salary,
       row_number() OVER (ORDER BY salary DESC, id) AS rn
FROM staff
ORDER BY rn;
