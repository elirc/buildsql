WITH product_revenue AS (
    SELECT product_id, sum(quantity * price) AS revenue
    FROM order_items
    GROUP BY product_id
), quartiles AS (
    SELECT product_id, revenue,
           ntile(4) OVER (ORDER BY revenue DESC, product_id) AS quartile
    FROM product_revenue
)
SELECT quartile,
       count(*) AS products,
       round(sum(revenue), 2) AS revenue,
       round(100 * sum(revenue) / sum(sum(revenue)) OVER (), 2) AS pct_of_total
FROM quartiles
GROUP BY quartile
ORDER BY quartile;
