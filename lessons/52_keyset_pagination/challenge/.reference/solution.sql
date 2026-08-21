WITH page1 AS (
    SELECT id, rating
    FROM reviews
    ORDER BY rating DESC, id DESC
    LIMIT 20
), cursor1 AS (
    SELECT rating, id FROM page1 ORDER BY rating, id LIMIT 1
), page2 AS (
    SELECT r.id, r.rating
    FROM reviews r, cursor1 c
    WHERE (r.rating, r.id) < (c.rating, c.id)
    ORDER BY r.rating DESC, r.id DESC
    LIMIT 20
), cursor2 AS (
    SELECT rating, id FROM page2 ORDER BY rating, id LIMIT 1
), page3 AS (
    SELECT r.id, r.rating
    FROM reviews r, cursor2 c
    WHERE (r.rating, r.id) < (c.rating, c.id)
    ORDER BY r.rating DESC, r.id DESC
    LIMIT 20
)
SELECT id, rating FROM page1
UNION ALL
SELECT id, rating FROM page2
UNION ALL
SELECT id, rating FROM page3
ORDER BY rating DESC, id DESC;
