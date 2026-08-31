SELECT q.id, q.price, q.tens, q.hundreds
FROM (
  SELECT p.id, p.price,
         round(p.price, -1) AS tens,
         round(p.price, -2) AS hundreds
  FROM products AS p
) AS q;
