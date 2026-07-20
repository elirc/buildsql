SELECT department, name, salary FROM (
  SELECT department, name, salary,
         rank() OVER (PARTITION BY department ORDER BY salary DESC) AS r
  FROM staff) t
WHERE r <= 3;
