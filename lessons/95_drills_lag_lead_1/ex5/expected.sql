SELECT category, id, price,
       lag(price) OVER (PARTITION BY category ORDER BY price, id) AS prev_in_cat
FROM products
WHERE price >= 495
ORDER BY category, price, id;
