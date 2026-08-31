SELECT id, price,
       CASE WHEN price >= 400 THEN 'premium' ELSE 'standard' END
FROM products;
