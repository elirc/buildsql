SELECT q.id, q.name,
       concat(lower(q.p1), '.', lower(q.p2), '@corp.example') AS work_email
FROM (
  SELECT s.id, s.name,
         split_part(s.name, ' ', 1) AS p1,
         split_part(s.name, ' ', 2) AS p2
  FROM staff AS s
) AS q;
