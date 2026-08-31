SELECT id, name, department, salary, quartile
FROM (SELECT id, name, department, salary, ntile(4) OVER w AS quartile
      FROM staff
      WINDOW w AS (PARTITION BY department ORDER BY salary DESC, id)) t
ORDER BY department, quartile, id;
