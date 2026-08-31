SELECT q.id, replace(q.folded, ' ', '-') AS slug
FROM (
  SELECT p.id, lower(p.name) AS folded
  FROM products AS p
) AS q;
