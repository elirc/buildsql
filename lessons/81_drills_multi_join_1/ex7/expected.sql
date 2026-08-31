WITH t AS (
    SELECT c.country, p.category, sum(oi.quantity * oi.price) AS revenue
    FROM customers c
    JOIN orders o ON o.customer_id = c.id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.created_at >= '2023-11-01'
    GROUP BY c.country, p.category
)
SELECT DISTINCT ON (country) country, category, revenue
FROM t
ORDER BY country, revenue DESC, category;
