SELECT q.id, q.price, q.as_int, q.as_int / 3 AS int_div, round(q.price / 3, 2) AS numeric_div
FROM (
  SELECT p.id, p.price, p.price::int AS as_int
  FROM products AS p
) AS q;
