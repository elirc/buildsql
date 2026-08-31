WITH mine AS (
    SELECT id, rating FROM reviews WHERE product_id = 77
)
SELECT m.id, m.rating,
       (SELECT sum(t.rating) FROM mine t
        WHERE (t.rating, t.id) <= (m.rating, m.id)) AS sum_rows,
       (SELECT sum(t.rating) FROM mine t
        WHERE t.rating <= m.rating) AS sum_range
FROM mine m
ORDER BY m.rating, m.id;
