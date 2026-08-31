SELECT id, name, salary,
       trim(to_char(salary, '999999.00')) AS salary_text
FROM staff
WHERE id <= 20
ORDER BY 1;
