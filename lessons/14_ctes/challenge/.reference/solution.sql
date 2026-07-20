WITH RECURSIVE chain AS (
    SELECT id, name, manager_id, 1 AS pos
    FROM staff
    WHERE id = 442
    UNION ALL
    SELECT s.id, s.name, s.manager_id, chain.pos + 1
    FROM staff s
    JOIN chain ON s.id = chain.manager_id
)
SELECT pos, id, name
FROM chain
ORDER BY pos;
