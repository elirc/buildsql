SELECT left(upper(name), 12) || ' — $' || price::text AS card
FROM products;
