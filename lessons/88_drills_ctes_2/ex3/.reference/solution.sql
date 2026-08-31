SELECT c.country,
       count(*) AS buyers,
       round(avg(pc.orders), 2) AS avg_orders,
       max(pc.orders) AS max_orders
FROM (SELECT customer_id, count(*) AS orders
      FROM orders
      GROUP BY customer_id) pc
JOIN customers c ON c.id = pc.customer_id
GROUP BY c.country
ORDER BY c.country;
