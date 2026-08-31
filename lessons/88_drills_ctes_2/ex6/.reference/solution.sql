SELECT tier, lo, count(*) AS products
FROM (SELECT CASE WHEN price < 100 THEN 'budget'
                  WHEN price < 300 THEN 'mid'
                  ELSE 'premium' END AS tier,
             CASE WHEN price < 100 THEN 0
                  WHEN price < 300 THEN 100
                  ELSE 300 END AS lo
      FROM products) t
GROUP BY tier, lo
ORDER BY lo;
