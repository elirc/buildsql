SELECT name, salary, ntile(4) OVER (ORDER BY salary DESC, id)
FROM staff ORDER BY salary DESC, id;
