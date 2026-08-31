SELECT id, name, hired_on,
       age(DATE '2023-11-14', hired_on) AS tenure,
       date_part('year', age(DATE '2023-11-14', hired_on))::int AS full_years
FROM staff
WHERE department = 'sales'
ORDER BY 3, 1;
