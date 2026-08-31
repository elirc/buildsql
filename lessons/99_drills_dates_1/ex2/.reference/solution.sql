SELECT id, name, hired_on,
       substr(hired_on::text, 1, 7) AS hire_month
FROM staff
WHERE id <= 20
ORDER BY 1;
