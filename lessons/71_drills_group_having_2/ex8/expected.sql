SELECT CASE WHEN orders <= 5 THEN '1-5'
            WHEN orders <= 10 THEN '6-10'
            ELSE '11+' END AS bucket,
       count(*) AS customers
FROM (SELECT customer_id, count(*) AS orders
      FROM orders
      GROUP BY customer_id) t
GROUP BY 1
ORDER BY 1;
