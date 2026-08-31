SELECT id, category, price,
       CASE WHEN category IN ('electronics', 'toys')
            THEN CASE WHEN price >= 250 THEN 'hero' ELSE 'volume' END
            ELSE CASE WHEN price >= 250 THEN 'premium-other' ELSE 'other' END
       END
FROM products;
