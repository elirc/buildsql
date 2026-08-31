SELECT s.id, s.name,
       coalesce('reports to ' || cast(s.manager_id AS text), 'CEO') AS reporting_line
FROM staff AS s;
