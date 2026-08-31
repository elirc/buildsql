SELECT upper(substring(name FROM 1 FOR 1)) AS initial, count(*) AS customers
FROM customers
GROUP BY 1
ORDER BY 1;
