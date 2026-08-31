SELECT q.id, q.name, q.price
FROM (
  SELECT p.id, p.name, p.price, p.price % 1 AS cents
  FROM products AS p
) AS q
ORDER BY q.cents DESC, q.id
LIMIT 20;
