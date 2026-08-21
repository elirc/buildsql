SELECT id, name, coalesce(manager_id, 0) AS manager_or_zero FROM staff;
