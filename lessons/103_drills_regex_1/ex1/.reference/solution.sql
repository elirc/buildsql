SELECT id, email,
       email ~ '^user[[:digit:]][[:digit:]]@' AS two_digit_id
FROM customers
WHERE id <= 20
ORDER BY 1;
