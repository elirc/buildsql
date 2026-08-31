SELECT count(price) AS products,
       min(price) AS cheapest,
       max(price) AS dearest,
       round(sum(price) / count(*), 2) AS avg_price
FROM products
WHERE category = 'garden';
