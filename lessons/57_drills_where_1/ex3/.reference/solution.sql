SELECT s.id, s.name, s.hired_on
FROM staff AS s
WHERE s.hired_on < '2015-01-01'::date;
