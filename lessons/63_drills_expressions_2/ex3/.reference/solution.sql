SELECT p.id,
       substring(p.name FROM 1 FOR 6)                  AS head,
       substring(p.name FROM length(p.name) - 3)       AS tail
FROM products AS p;
