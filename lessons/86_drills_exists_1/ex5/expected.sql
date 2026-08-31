SELECT p.id, p.name, p.category, p.price
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM products t
                  WHERE t.category = p.category
                    AND t.price < p.price)
ORDER BY p.category, p.id;
