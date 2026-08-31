SELECT ranked.id, ranked.name, ranked.category
FROM (
  SELECT p.id, p.name, p.category
  FROM products AS p
  ORDER BY p.name, p.id
  LIMIT 10
) AS ranked
ORDER BY ranked.name, ranked.id;
