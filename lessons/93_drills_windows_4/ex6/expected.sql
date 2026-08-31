WITH per_customer AS (
    SELECT customer_id, count(*) AS orders, sum(total) AS revenue
    FROM orders
    GROUP BY customer_id
), deciles AS (
    SELECT customer_id, orders, revenue,
           ntile(10) OVER (ORDER BY orders DESC, customer_id) AS decile
    FROM per_customer
)
SELECT decile,
       count(*) AS customers,
       min(orders) AS min_orders,
       max(orders) AS max_orders,
       round(sum(revenue), 2) AS revenue
FROM deciles
GROUP BY decile
ORDER BY decile;
