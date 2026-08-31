SELECT id, name, hired_on,
       count(*) OVER (ORDER BY hired_on, id) AS hires_to_date
FROM staff
ORDER BY hired_on, id;
