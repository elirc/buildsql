WITH pairs AS (
    SELECT DISTINCT o.customer_id, p.category
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.created_at >= DATE '2023-11-01'
), counted AS (
    SELECT customer_id, count(*) AS categories
    FROM pairs
    GROUP BY customer_id
    HAVING count(*) >= 3
)
SELECT c.id, c.name, counted.categories
FROM counted
JOIN customers c ON c.id = counted.customer_id
ORDER BY counted.categories DESC, c.id;
