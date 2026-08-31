SELECT q.id, q.price, round(q.raw, 2) AS to_cents, q.raw AS unrounded
FROM (
  SELECT p.id, p.price, p.price * 0.8 AS raw
  FROM products AS p
) AS q;
