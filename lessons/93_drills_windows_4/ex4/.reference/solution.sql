SELECT bucket,
       count(*) AS countries,
       min(customers) AS min_customers,
       max(customers) AS max_customers
FROM (SELECT country, customers,
             ntile(5) OVER (ORDER BY customers DESC, country) AS bucket
      FROM (SELECT country, count(*) AS customers
            FROM customers
            GROUP BY country) c) b
GROUP BY bucket
ORDER BY bucket;
