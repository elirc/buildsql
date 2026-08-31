SELECT id, category,
       CASE WHEN category = 'books' THEN 'media'
            WHEN category = 'electronics' THEN 'tech'
       END
FROM products;
