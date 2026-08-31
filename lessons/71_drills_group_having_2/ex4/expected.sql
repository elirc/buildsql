SELECT total > 1000 AS big_order,
       count(*) AS orders,
       round(avg(total), 2) AS avg_total
FROM orders
GROUP BY 1
ORDER BY 1;
