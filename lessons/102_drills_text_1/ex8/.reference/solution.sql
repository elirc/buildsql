SELECT left(name, position(' ' IN name) - 1) AS adjective,
       count(*) AS products
FROM products
GROUP BY 1
ORDER BY 2 DESC, 1
LIMIT 5;
