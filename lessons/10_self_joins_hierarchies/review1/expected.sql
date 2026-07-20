SELECT t.id, t.name FROM staff me
JOIN staff t ON t.manager_id = me.manager_id AND t.id <> me.id
WHERE me.id = 42;
