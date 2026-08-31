SELECT p.id, p.price,
       CASE p.category
         WHEN 'food' THEN round(p.price * 0.95, 2)
         ELSE p.price
       END AS selling_price
FROM products AS p;
