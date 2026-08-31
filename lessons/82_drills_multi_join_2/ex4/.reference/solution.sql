WITH per_product AS (
    SELECT product_id,
           sum(quantity) AS units,
           sum(quantity * price) AS revenue
    FROM order_items
    GROUP BY product_id
), sales AS (
    SELECT p.category, sum(pp.units) AS units, sum(pp.revenue) AS revenue
    FROM per_product pp
    JOIN products p ON p.id = pp.product_id
    GROUP BY p.category
), rated AS (
    SELECT p.category, round(avg(r.rating), 2) AS avg_rating
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    GROUP BY p.category
)
SELECT s.category, s.units, s.revenue, rd.avg_rating
FROM sales s
JOIN rated rd ON rd.category = s.category
ORDER BY s.category;
