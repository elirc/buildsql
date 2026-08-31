SELECT id, name, hired_on,
       extract(year FROM age(DATE '2023-11-14', hired_on))::int * 12
         + extract(month FROM age(DATE '2023-11-14', hired_on))::int AS tenure_months
FROM staff
WHERE department = 'support'
ORDER BY tenure_months DESC, id;
