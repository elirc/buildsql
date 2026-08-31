SELECT a.id, a.name, b.id, b.name, b.hired_on - a.hired_on
FROM staff a
JOIN staff b ON b.manager_id = a.manager_id
WHERE b.hired_on >= a.hired_on + 1825
ORDER BY a.id, b.id;
