SELECT id, name, hired_on,
       to_char(hired_on, 'YYYY-MM') AS hire_month
FROM staff
WHERE id <= 20
ORDER BY id;
