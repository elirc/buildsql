SELECT s.id, s.name, s.hired_on,
       (extract(year FROM a.tenure) * 12 + extract(month FROM a.tenure))::int AS tenure_months
FROM staff s
CROSS JOIN LATERAL (SELECT age(DATE '2023-11-14', s.hired_on) AS tenure) a
WHERE s.department = 'support'
ORDER BY 4 DESC, 1;
