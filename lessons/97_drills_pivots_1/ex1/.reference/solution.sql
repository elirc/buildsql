SELECT count(CASE WHEN category = 'books' THEN 1 END) AS books,
       count(CASE WHEN category = 'clothing' THEN 1 END) AS clothing,
       count(CASE WHEN category = 'electronics' THEN 1 END) AS electronics,
       count(CASE WHEN category = 'food' THEN 1 END) AS food,
       count(CASE WHEN category = 'garden' THEN 1 END) AS garden,
       count(CASE WHEN category = 'toys' THEN 1 END) AS toys
FROM products;
