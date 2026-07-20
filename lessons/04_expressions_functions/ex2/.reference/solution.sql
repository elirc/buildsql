SELECT name || ' (' || department || ')' AS badge,
       round(salary, -3) AS salary_band
FROM staff;
