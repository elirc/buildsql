SELECT s.id, s.name, p.parts
FROM staff s
CROSS JOIN LATERAL (
  SELECT count(*)::int AS parts
  FROM regexp_split_to_table(s.name, ' ') AS w) p
WHERE NOT (s.name ~ '^[A-Za-z]+ [A-Za-z]+$')
ORDER BY s.id;
