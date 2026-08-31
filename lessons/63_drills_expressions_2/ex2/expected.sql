SELECT id, name, coalesce(manager_id::text, 'ROOT') FROM staff;
