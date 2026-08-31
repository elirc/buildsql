SELECT id, name,
       CASE department
         WHEN 'sales' THEN 'field'
         WHEN 'support' THEN 'field'
         ELSE 'office'
       END
FROM staff;
