SELECT id, status, total FROM orders
WHERE (status = 'pending' OR status = 'paid') AND total > 1000;
