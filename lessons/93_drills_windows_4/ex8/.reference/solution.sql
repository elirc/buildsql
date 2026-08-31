WITH product_revenue AS (
    SELECT product_id, sum(quantity * price) AS revenue
    FROM order_items
    GROUP BY product_id
), quartiles AS (
    SELECT product_id, revenue,
           ntile(4) OVER (ORDER BY revenue DESC, product_id) AS quartile
    FROM product_revenue
), per_quartile AS (
    SELECT quartile, count(*) AS products, sum(revenue) AS revenue
    FROM quartiles
    GROUP BY quartile
), total AS (
    SELECT sum(revenue) AS revenue FROM per_quartile
)
SELECT q.quartile, q.products,
       round(q.revenue, 2) AS revenue,
       round(100 * q.revenue / t.revenue, 2) AS pct_of_total
FROM per_quartile q
CROSS JOIN total t
ORDER BY q.quartile;
