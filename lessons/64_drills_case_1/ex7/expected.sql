SELECT id, category, price,
       CASE WHEN price < 100 THEN 'A'
            WHEN price < 200 THEN 'B'
            WHEN price < 300 THEN 'C'
            WHEN price < 400 THEN 'D'
            ELSE 'E'
       END,
       CASE WHEN category IN ('electronics', 'garden') THEN 'hard'
            WHEN category IN ('clothing', 'toys') THEN 'soft'
            ELSE 'consumable'
       END
FROM products;
