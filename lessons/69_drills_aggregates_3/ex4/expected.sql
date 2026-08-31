SELECT min(price) AS cheapest,
       max(price) AS dearest,
       count(DISTINCT price) AS distinct_prices,
       round(max(price) - min(price), 2) AS spread
FROM products;
