SELECT p.id, p.name, p.price,
       (SELECT count(*) FROM products c
        WHERE c.category = 'books' AND c.price < p.price) AS cheaper_books
FROM products p
WHERE p.category = 'books' AND p.price > 495
ORDER BY p.id;
