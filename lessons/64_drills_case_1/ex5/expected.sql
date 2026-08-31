SELECT id, price,
       CASE WHEN category = 'food' THEN round(price * 0.95, 2)
            ELSE price
       END
FROM products;
