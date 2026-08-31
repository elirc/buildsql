SELECT decile,
       count(*) AS customers,
       min(orders) AS min_orders,
       max(orders) AS max_orders,
       round(sum(revenue), 2) AS revenue
FROM (SELECT customer_id, orders, revenue,
             ntile(10) OVER (ORDER BY orders DESC, customer_id) AS decile
      FROM (SELECT customer_id, count(*) AS orders, sum(total) AS revenue
            FROM orders
            GROUP BY customer_id) pc) d
GROUP BY decile
ORDER BY decile;
