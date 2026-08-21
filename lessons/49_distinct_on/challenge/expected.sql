SELECT category, name, price
FROM (
    SELECT DISTINCT ON (category) category, name, price
    FROM products
    ORDER BY category, price DESC, id
) best
ORDER BY price DESC;
