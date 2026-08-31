SELECT id, name, salary,
       to_char(salary, 'FM999999.00') AS salary_text
FROM staff
WHERE id <= 20
ORDER BY id;
