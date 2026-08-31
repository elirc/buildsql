SELECT p.id, p.category,
       CASE p.category
         WHEN 'books' THEN 'media'
         WHEN 'electronics' THEN 'tech'
       END AS editorial_group
FROM products AS p;
