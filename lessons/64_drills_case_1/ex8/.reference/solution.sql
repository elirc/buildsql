SELECT p.id, p.category, p.price,
       CASE WHEN p.category IN ('electronics', 'toys') AND p.price >= 250 THEN 'hero'
            WHEN p.category IN ('electronics', 'toys')                    THEN 'volume'
            WHEN p.price >= 250                                           THEN 'premium-other'
            ELSE 'other'
       END AS matrix
FROM products AS p;
