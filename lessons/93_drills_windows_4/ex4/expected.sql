WITH per_country AS (
    SELECT country, count(*) AS customers
    FROM customers
    GROUP BY country
), bucketed AS (
    SELECT country, customers,
           ntile(5) OVER (ORDER BY customers DESC, country) AS bucket
    FROM per_country
)
SELECT bucket,
       count(*) AS countries,
       min(customers) AS min_customers,
       max(customers) AS max_customers
FROM bucketed
GROUP BY bucket
ORDER BY bucket;
