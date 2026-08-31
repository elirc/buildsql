SELECT p.id,
       p.price,
       p.price * 0.2 AS vat,
       p.price * 1.2 AS gross
FROM products AS p;
