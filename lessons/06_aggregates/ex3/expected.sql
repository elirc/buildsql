SELECT count(*), count(manager_id), round(avg(salary), 2),
       max(salary), min(hired_on)
FROM staff;
