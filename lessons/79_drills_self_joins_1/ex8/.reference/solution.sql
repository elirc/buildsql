WITH cnt AS (
    SELECT manager_id, count(*) AS reports
    FROM staff
    WHERE manager_id IS NOT NULL
    GROUP BY manager_id
), best AS (
    SELECT DISTINCT ON (manager_id) manager_id, name
    FROM staff
    WHERE manager_id IS NOT NULL
    ORDER BY manager_id, salary DESC, id
)
SELECT m.id, m.name, cnt.reports, best.name
FROM staff m
JOIN cnt ON cnt.manager_id = m.id
JOIN best ON best.manager_id = m.id
ORDER BY m.id;
