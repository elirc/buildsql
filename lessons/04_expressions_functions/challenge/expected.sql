SELECT left(upper(name), 12) || ' — $' || price::text
FROM products;
