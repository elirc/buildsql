SELECT id, name, department
FROM staff
WHERE NOT (department = 'sales' OR department = 'support');
