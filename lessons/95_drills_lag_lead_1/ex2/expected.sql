SELECT id, name, hired_on,
       lead(hired_on) OVER (ORDER BY hired_on, id) AS next_hire
FROM staff
WHERE department = 'engineering'
ORDER BY hired_on, id;
