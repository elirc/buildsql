WITH eng AS (
  SELECT id, name, hired_on
  FROM staff
  WHERE department = 'engineering')
SELECT id, name, hired_on,
       lead(hired_on) OVER (ORDER BY hired_on, id) AS next_hire
FROM eng
ORDER BY hired_on, id;
