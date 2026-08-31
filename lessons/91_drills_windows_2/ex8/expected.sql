WITH product_revenue AS (
    SELECT p.category, oi.product_id, sum(oi.quantity * oi.price) AS revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    GROUP BY p.category, oi.product_id
), shares AS (
    SELECT category, product_id, revenue,
           sum(revenue) OVER (PARTITION BY category) AS category_revenue,
           row_number() OVER (PARTITION BY category
                              ORDER BY revenue DESC, product_id) AS rn
    FROM product_revenue
)
SELECT category, product_id,
       round(revenue, 2) AS revenue,
       round(category_revenue, 2) AS category_revenue,
       round(100 * revenue / category_revenue, 3) AS pct_of_category
FROM shares
WHERE rn = 1
ORDER BY category;
