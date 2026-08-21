-- 52_keyset_pagination/ex2: page 2 of the catalogue, keyset-style (README "Exercise 2").
-- The cursor CTE is provided: it is the last row of page 1, the pair a real
-- app echoes into its "next page" link. Write the page-2 query below it.
-- Columns: id, category, name. Exactly 20 rows, ordered by category, then id.
WITH last_seen AS (
    SELECT category, id
    FROM products
    ORDER BY category, id
    OFFSET 19
    LIMIT 1
)
SELECT 1;
