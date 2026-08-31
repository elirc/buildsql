SELECT count(*) AS products,
       min(price) AS cheapest,
       max(price) AS dearest,
       round(avg(price), 2) AS avg_price
FROM products
WHERE category = 'garden';
