SELECT a.id, a.name, b.id AS id2, b.name AS name2,
       (b.hired_on - a.hired_on) AS days_apart
FROM staff a
JOIN staff b ON b.manager_id = a.manager_id
            AND b.hired_on - a.hired_on >= 1825
ORDER BY a.id, b.id;
