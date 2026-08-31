SELECT id, email,
       strpos(email, '@') AS at_pos,
       char_length(email) - strpos(email, '@') AS domain_len
FROM customers
WHERE id <= 20
ORDER BY 1;
