WITH ordered AS (
    SELECT country, id, name, created_at,
           rank() OVER (PARTITION BY country ORDER BY created_at, id) AS rn
    FROM customers
)
SELECT country, id, name, created_at, rn
FROM ordered
WHERE rn <= 2
ORDER BY country, rn;
