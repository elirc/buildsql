SELECT id, upper(left(category, 3)) || '-' || id::text AS sku FROM products;
