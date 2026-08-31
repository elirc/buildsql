WITH counts AS (
    SELECT p.category, p.id, p.name, count(r.id) AS reviews
    FROM products p
    LEFT JOIN reviews r ON r.product_id = p.id
    GROUP BY p.category, p.id, p.name
), hi AS (
    SELECT DISTINCT ON (category) category, name, reviews
    FROM counts
    ORDER BY category, reviews DESC, id
), lo AS (
    SELECT DISTINCT ON (category) category, name, reviews
    FROM counts
    ORDER BY category, reviews, id
)
SELECT hi.category,
       hi.name AS most_reviewed,
       hi.reviews AS most,
       lo.name AS least_reviewed,
       lo.reviews AS least
FROM hi
JOIN lo ON lo.category = hi.category
ORDER BY hi.category;
