SELECT category,
       CASE WHEN price < 50 THEN 'budget'
            WHEN price < 200 THEN 'mid'
            ELSE 'premium' END AS tier,
       count(*)
FROM products
GROUP BY category, tier;
