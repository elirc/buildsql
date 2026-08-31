SELECT id, name, salary,
       round((SELECT c.salary FROM staff c WHERE c.manager_id IS NULL) - salary, 2)
         AS below_ceo
FROM staff
WHERE department = 'engineering'
ORDER BY id;
