SELECT id, name,
       array_length(regexp_split_to_array(name, ' '), 1) AS parts
FROM staff
WHERE name !~ '^[A-Za-z]+ [A-Za-z]+$'
ORDER BY id;
