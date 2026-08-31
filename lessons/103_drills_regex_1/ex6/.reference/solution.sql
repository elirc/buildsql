SELECT id, name,
       regexp_replace(name, '[^[:alpha:] ]+', '', 'g') AS letters_only
FROM staff
WHERE id <= 30
ORDER BY 1;
