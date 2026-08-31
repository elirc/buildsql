WITH sales AS (
    SELECT p.category,
           sum(oi.quantity) AS units,
           sum(oi.quantity * oi.price) AS revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
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
