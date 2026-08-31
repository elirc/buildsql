SELECT a.id, a.name, b.id AS id2, b.name AS name2
FROM staff a
JOIN staff b ON b.manager_id = a.manager_id AND a.id < b.id
WHERE a.department = 'engineering'
ORDER BY a.id, b.id;
