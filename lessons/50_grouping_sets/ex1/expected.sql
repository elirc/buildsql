SELECT status, sum(total) AS revenue
FROM orders
GROUP BY ROLLUP (status);
