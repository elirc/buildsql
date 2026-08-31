SELECT s.id,
       s.name,
       coalesce(cast(s.manager_id AS text), 'ROOT') AS manager_label
FROM staff AS s;
