SELECT s.id, s.name, s.salary
FROM staff s
WHERE s.manager_id IS NOT NULL
  AND s.salary > (SELECT avg(t.salary) FROM staff t
                  WHERE t.manager_id = s.manager_id)
ORDER BY s.id;
