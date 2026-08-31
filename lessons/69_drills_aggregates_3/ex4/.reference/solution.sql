SELECT min(price) AS cheapest,
       max(price) AS dearest,
       (SELECT count(*) FROM (SELECT DISTINCT price FROM products) d) AS distinct_prices,
       round(max(price) - min(price), 2) AS spread
FROM products;
