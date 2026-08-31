WITH per_country AS (
    SELECT country, count(*) AS customers
    FROM customers
    GROUP BY country
), running AS (
    SELECT country, customers,
           sum(customers) OVER (ORDER BY customers DESC, country)
             AS running_customers,
           round(100.0 * sum(customers) OVER (ORDER BY customers DESC, country)
                 / sum(customers) OVER (), 2) AS cum_pct
    FROM per_country
)
SELECT country, customers, running_customers, cum_pct
FROM running
WHERE cum_pct <= 80
ORDER BY running_customers;
