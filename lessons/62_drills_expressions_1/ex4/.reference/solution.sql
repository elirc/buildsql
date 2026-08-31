SELECT p.id,
       p.price,
       floor(p.price)          AS cut,
       cast(round(p.price) AS int) AS cast_result
FROM products AS p;
