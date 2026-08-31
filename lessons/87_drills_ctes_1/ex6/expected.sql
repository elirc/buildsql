WITH per_customer AS (
    SELECT customer_id, count(*) AS orders, sum(total) AS revenue
    FROM orders
    WHERE status <> 'cancelled'
    GROUP BY customer_id
), tiered AS (
    SELECT customer_id, orders, revenue,
           CASE WHEN orders >= 15 THEN 'heavy'
                WHEN orders >= 8  THEN 'regular'
                ELSE 'light' END AS tier
    FROM per_customer
)
SELECT tier,
       count(*) AS customers,
       round(sum(revenue), 2) AS revenue,
       round(avg(orders), 2) AS avg_orders
FROM tiered
GROUP BY tier
ORDER BY tier;
