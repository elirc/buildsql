SELECT id, name, salary
FROM (SELECT s.id, s.name, s.salary,
             avg(s.salary) OVER (PARTITION BY s.manager_id) AS team_avg
      FROM staff s
      WHERE s.manager_id IS NOT NULL) t
WHERE salary > team_avg
ORDER BY id;
