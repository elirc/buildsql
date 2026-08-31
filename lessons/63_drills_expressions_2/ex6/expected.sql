SELECT id, email, replace(split_part(email, '@', 1), 'user', '') FROM customers;
