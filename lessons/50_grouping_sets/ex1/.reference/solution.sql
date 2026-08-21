-- 50_grouping_sets/ex1 reference
SELECT status, sum(total) AS revenue
FROM orders
GROUP BY ROLLUP (status);
