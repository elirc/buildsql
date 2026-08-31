WITH product_revenue AS (
    SELECT p.category, oi.product_id, sum(oi.quantity * oi.price) AS revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    GROUP BY p.category, oi.product_id
), totals AS (
    SELECT category,
           sum(revenue) AS category_revenue,
           max(revenue) AS top_revenue
    FROM product_revenue
    GROUP BY category
)
SELECT t.category, pr.product_id,
       round(pr.revenue, 2) AS revenue,
       round(t.category_revenue, 2) AS category_revenue,
       round(100 * pr.revenue / t.category_revenue, 3) AS pct_of_category
FROM totals t
JOIN product_revenue pr
  ON pr.category = t.category AND pr.revenue = t.top_revenue
ORDER BY t.category;
