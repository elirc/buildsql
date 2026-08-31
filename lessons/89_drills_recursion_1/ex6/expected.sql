WITH RECURSIVE tree AS (
    SELECT id AS root, id
    FROM staff
    UNION ALL
    SELECT t.root, s.id
    FROM staff s
    JOIN tree t ON s.manager_id = t.id
)
SELECT s.id, s.name, count(*) - 1 AS descendants
FROM tree t
JOIN staff s ON s.id = t.root
GROUP BY s.id, s.name
HAVING count(*) > 1
ORDER BY descendants DESC, s.id;
