SELECT id, split_part(email, '@', 1) FROM customers WHERE id <= 100;
