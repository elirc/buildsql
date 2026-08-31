SELECT q.id, q.name, round(q.monthly, 2) AS monthly_pay
FROM (
  SELECT s.id, s.name, s.salary / 12 AS monthly
  FROM staff AS s
) AS q;
