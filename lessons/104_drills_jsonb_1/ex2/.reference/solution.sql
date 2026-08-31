SELECT attributes #>> '{size}' AS size,
       count(id) AS products
FROM products
GROUP BY 1
ORDER BY 1;
