SELECT split_part(name, ' ', 1) AS adjective,
       count(*) AS products
FROM products
GROUP BY split_part(name, ' ', 1)
ORDER BY products DESC, adjective
LIMIT 5;
