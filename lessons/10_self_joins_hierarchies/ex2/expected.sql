SELECT a.name, b.name FROM staff a
JOIN staff b ON a.department = b.department AND a.id < b.id
WHERE a.department = 'finance';
