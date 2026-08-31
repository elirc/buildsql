SELECT s.id, s.name,
       CASE WHEN s.department IN ('sales', 'support') THEN 'field'
            ELSE 'office'
       END AS desk
FROM staff AS s;
