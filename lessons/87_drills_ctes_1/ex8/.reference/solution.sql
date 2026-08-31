WITH joined AS (
    SELECT p.category, p.id, p.name,
           count(*) AS reviews,
           round(avg(r.rating), 3) AS avg_rating
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    GROUP BY p.category, p.id, p.name
), ranked AS (
    SELECT category, id, name, reviews, avg_rating,
           rank() OVER (PARTITION BY category ORDER BY avg_rating) AS worst_rank
    FROM joined
)
SELECT category, id, name, reviews, avg_rating
FROM ranked
WHERE worst_rank = 1
ORDER BY category, id;
