SELECT p.id, p.name, p.price, count(c.id) AS cheaper_books
FROM products p
LEFT JOIN products c ON c.category = 'books' AND c.price < p.price
WHERE p.category = 'books' AND p.price > 495
GROUP BY p.id, p.name, p.price
ORDER BY p.id;
