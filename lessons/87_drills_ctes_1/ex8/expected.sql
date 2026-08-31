WITH agg AS (
    SELECT product_id, count(*) AS reviews, round(avg(rating), 3) AS avg_rating
    FROM reviews
    GROUP BY product_id
), joined AS (
    SELECT p.category, p.id, p.name, a.reviews, a.avg_rating
    FROM agg a
    JOIN products p ON p.id = a.product_id
), worst AS (
    SELECT category, min(avg_rating) AS avg_rating
    FROM joined
    GROUP BY category
)
SELECT j.category, j.id, j.name, j.reviews, j.avg_rating
FROM worst w
JOIN joined j ON j.category = w.category AND j.avg_rating = w.avg_rating
ORDER BY j.category, j.id;
