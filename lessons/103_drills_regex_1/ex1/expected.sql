SELECT id, email,
       email ~ '^user[0-9]{2}@' AS two_digit_id
FROM customers
WHERE id <= 20
ORDER BY id;
