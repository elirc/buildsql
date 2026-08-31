SELECT country, id, name, created_at, rn
FROM (SELECT country, id, name, created_at,
             row_number() OVER (PARTITION BY country
                                ORDER BY created_at, id) AS rn
      FROM customers) t
WHERE rn <= 2
ORDER BY country, rn;
