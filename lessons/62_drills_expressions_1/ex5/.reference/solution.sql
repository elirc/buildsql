SELECT p.id,
       p.price,
       trunc(p.price)   AS down,
       ceiling(p.price) AS up
FROM products AS p;
