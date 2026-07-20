SELECT category, name, price FROM products p
WHERE p.id IN (SELECT p2.id FROM products p2
               WHERE p2.category = p.category
               ORDER BY p2.price DESC, p2.id ASC LIMIT 5)
ORDER BY category ASC, price DESC, id ASC;
