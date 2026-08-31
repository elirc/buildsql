SELECT q.id, q.name
FROM (
  SELECT p.id, p.name, p.price
  FROM products AS p
  ORDER BY p.price DESC, p.id
  LIMIT 15
) AS q
ORDER BY q.price DESC, q.id;
