SELECT p.id,
       p.price,
       p.price + p.price * 0.05 AS marked_up,
       (p.price + p.price) * 0.05 AS the_bug
FROM products AS p;
