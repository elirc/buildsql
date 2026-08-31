SELECT p.id, p.category, p.price,
       CASE WHEN p.price >= 400 THEN 'E'
            WHEN p.price >= 300 THEN 'D'
            WHEN p.price >= 200 THEN 'C'
            WHEN p.price >= 100 THEN 'B'
            ELSE 'A'
       END AS band,
       CASE p.category
         WHEN 'electronics' THEN 'hard'
         WHEN 'garden'      THEN 'hard'
         WHEN 'clothing'    THEN 'soft'
         WHEN 'toys'        THEN 'soft'
         ELSE 'consumable'
       END AS dept
FROM products AS p;
