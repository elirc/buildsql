SELECT id, name,
       regexp_replace(name, '[^A-Za-z ]', '', 'g') AS letters_only
FROM staff
WHERE id <= 30
ORDER BY id;
