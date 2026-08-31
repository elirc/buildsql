SELECT (total > 1000) AS big_order,
       count(*) AS orders,
       round(avg(total), 2) AS avg_total
FROM orders
GROUP BY (total > 1000)
ORDER BY (total > 1000);
