SELECT name, salary, row_number() OVER (ORDER BY salary DESC, id)
FROM staff ORDER BY 3;
