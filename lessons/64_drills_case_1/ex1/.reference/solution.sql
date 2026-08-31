SELECT p.id, p.price,
       CASE WHEN p.price < 400 THEN 'standard' ELSE 'premium' END AS tier
FROM products AS p;
