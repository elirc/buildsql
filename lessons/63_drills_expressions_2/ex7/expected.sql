SELECT id, name,
       lower(split_part(name, ' ', 1)) || '.' || lower(split_part(name, ' ', 2)) || '@corp.example'
FROM staff;
