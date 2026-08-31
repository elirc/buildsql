WITH counts AS (
    SELECT p.category, p.id, p.name, count(r.id) AS reviews
    FROM products p
    LEFT JOIN reviews r ON r.product_id = p.id
    GROUP BY p.category, p.id, p.name
), ranked AS (
    SELECT category, id, name, reviews,
           row_number() OVER (PARTITION BY category
                              ORDER BY reviews DESC, id) AS hi,
           row_number() OVER (PARTITION BY category
                              ORDER BY reviews, id) AS lo
    FROM counts
)
SELECT category,
       max(name)    FILTER (WHERE hi = 1) AS most_reviewed,
       max(reviews) FILTER (WHERE hi = 1) AS most,
       max(name)    FILTER (WHERE lo = 1) AS least_reviewed,
       max(reviews) FILTER (WHERE lo = 1) AS least
FROM ranked
GROUP BY category
ORDER BY category;
