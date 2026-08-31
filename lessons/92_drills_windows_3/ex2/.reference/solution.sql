SELECT s.id, s.name, s.hired_on,
       (SELECT count(*) FROM staff t
        WHERE (t.hired_on, t.id) <= (s.hired_on, s.id)) AS hires_to_date
FROM staff s
ORDER BY s.hired_on, s.id;
