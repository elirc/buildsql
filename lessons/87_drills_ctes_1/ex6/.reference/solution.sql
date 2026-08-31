SELECT CASE WHEN pc.orders >= 15 THEN 'heavy'
            WHEN pc.orders >= 8  THEN 'regular'
            ELSE 'light' END AS tier,
       count(*) AS customers,
       round(sum(pc.revenue), 2) AS revenue,
       round(avg(pc.orders), 2) AS avg_orders
FROM (SELECT customer_id, count(*) AS orders, sum(total) AS revenue
      FROM orders
      WHERE status <> 'cancelled'
      GROUP BY customer_id) pc
GROUP BY 1
ORDER BY 1;
