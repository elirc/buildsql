SELECT quartile,
       count(*) AS staff,
       round(min(salary), 2) AS min_salary,
       round(max(salary), 2) AS max_salary
FROM (SELECT salary, ntile(4) OVER (ORDER BY salary DESC, id) AS quartile
      FROM staff) t
GROUP BY quartile
ORDER BY quartile;
