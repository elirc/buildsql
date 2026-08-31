SELECT count(*) AS products,
       count(*) FILTER (WHERE price < 50) AS cheap,
       count(*) FILTER (WHERE price > 450) AS dear,
       round(avg(price) FILTER (WHERE category = 'electronics'), 2) AS avg_electronics
FROM products;
