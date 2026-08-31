SELECT p.id, p.price, round(p.price, 0) AS whole_dollars
FROM products AS p;
