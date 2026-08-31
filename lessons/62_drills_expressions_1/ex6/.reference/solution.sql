SELECT q.id, q.salary, q.band, q.salary - q.band AS drift
FROM (
  SELECT s.id, s.salary, round(s.salary, -3) AS band
  FROM staff AS s
) AS q;
