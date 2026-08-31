SELECT id,
       upper(left(category, 3)) || '-' || lpad(id::text, 6, '0') || '-' || replace(lower(name), ' ', '_')
FROM products;
