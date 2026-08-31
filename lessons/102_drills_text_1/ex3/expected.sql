SELECT id, email,
       position('@' IN email) AS at_pos,
       length(email) - position('@' IN email) AS domain_len
FROM customers
WHERE id <= 20
ORDER BY id;
