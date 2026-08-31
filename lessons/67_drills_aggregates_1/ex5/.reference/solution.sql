SELECT count(*) AS products,
       sum(CASE WHEN price < 50 THEN 1 ELSE 0 END) AS cheap,
       sum(CASE WHEN price > 450 THEN 1 ELSE 0 END) AS dear,
       round(avg(CASE WHEN category = 'electronics' THEN price END), 2) AS avg_electronics
FROM products;
