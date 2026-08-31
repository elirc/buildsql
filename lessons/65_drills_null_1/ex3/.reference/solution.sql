SELECT id,
       CASE WHEN manager_id IS NULL THEN NULL
            ELSE name || ' -> ' || manager_id END AS piped,
       name || ' -> ' || coalesce(manager_id::text, '') AS joined
FROM staff
WHERE id <= 12
ORDER BY id;
