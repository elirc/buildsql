SELECT status, id, total
FROM (SELECT status, id, total,
             row_number() OVER (PARTITION BY status
                                ORDER BY total DESC, id) AS rn
      FROM orders) ranked
WHERE rn <= 3
ORDER BY status, total DESC, id;
