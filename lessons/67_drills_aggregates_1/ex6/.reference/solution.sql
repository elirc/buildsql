SELECT count(*) AS staff,
       (SELECT count(*) FROM (SELECT DISTINCT manager_id FROM staff
                              WHERE manager_id IS NOT NULL) m) AS managers,
       (SELECT count(*) FROM (SELECT DISTINCT department FROM staff) d) AS departments,
       sum(salary) AS payroll
FROM staff;
