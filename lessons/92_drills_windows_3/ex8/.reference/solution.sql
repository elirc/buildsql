WITH per_country AS (
    SELECT country, count(*) AS customers
    FROM customers
    GROUP BY country
), total AS (
    SELECT sum(customers) AS customers FROM per_country
), calc AS (
    SELECT p.country, p.customers,
           (SELECT sum(q.customers) FROM per_country q
            WHERE q.customers > p.customers
               OR (q.customers = p.customers AND q.country <= p.country))
             AS running_customers,
           t.customers AS all_customers
    FROM per_country p
    CROSS JOIN total t
)
SELECT country, customers, running_customers,
       round(100.0 * running_customers / all_customers, 2) AS cum_pct
FROM calc
WHERE round(100.0 * running_customers / all_customers, 2) <= 80
ORDER BY running_customers;
