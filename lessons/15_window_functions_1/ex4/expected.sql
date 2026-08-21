SELECT name, salary,
       rank() OVER (ORDER BY salary DESC) AS rnk,
       dense_rank() OVER (ORDER BY salary DESC) AS drnk
FROM staff
ORDER BY salary DESC, id;
