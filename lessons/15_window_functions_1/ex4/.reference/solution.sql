SELECT name,
       salary,
       rank()       OVER w AS rnk,
       dense_rank() OVER w AS drnk
FROM staff
WINDOW w AS (ORDER BY salary DESC)
ORDER BY salary DESC, id;
