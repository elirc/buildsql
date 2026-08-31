SELECT p.id, p.name, p.category, p.price
FROM products p
JOIN (SELECT category, min(price) AS price
      FROM products
      GROUP BY category) AS cheapest
  ON cheapest.category = p.category AND cheapest.price = p.price
ORDER BY p.category, p.id;
