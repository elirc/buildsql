SELECT count(*) FILTER (WHERE category = 'books') AS books,
       count(*) FILTER (WHERE category = 'clothing') AS clothing,
       count(*) FILTER (WHERE category = 'electronics') AS electronics,
       count(*) FILTER (WHERE category = 'food') AS food,
       count(*) FILTER (WHERE category = 'garden') AS garden,
       count(*) FILTER (WHERE category = 'toys') AS toys
FROM products;
