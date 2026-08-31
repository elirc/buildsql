WITH per_category AS (
    SELECT category, count(*) AS products
    FROM products
    GROUP BY category
)
SELECT p.category, p.products,
       (SELECT sum(q.products) FROM per_category q
        WHERE q.products > p.products
           OR (q.products = p.products AND q.category <= p.category))
         AS running_products
FROM per_category p
ORDER BY p.products DESC, p.category;
