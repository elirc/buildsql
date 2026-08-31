SELECT count(*) AS staff,
       count(DISTINCT manager_id) AS managers,
       count(DISTINCT department) AS departments,
       sum(salary) AS payroll
FROM staff;
