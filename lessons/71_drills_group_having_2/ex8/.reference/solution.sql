WITH per_customer AS (
  SELECT customer_id, count(*) AS orders
  FROM orders
  GROUP BY customer_id)
SELECT CASE WHEN orders < 6 THEN '1-5'
            WHEN orders < 11 THEN '6-10'
            ELSE '11+' END AS bucket,
       count(*) AS customers
FROM per_customer
GROUP BY 1
ORDER BY 1;
