SELECT s.id, s.name,
       (SELECT count(*) FROM staff t
        WHERE t.department = s.department AND t.salary > s.salary) AS richer_colleagues
FROM staff s
WHERE s.department = 'sales'
ORDER BY s.id;
