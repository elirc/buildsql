SELECT count(*) AS customers,
       (SELECT count(*) FROM (SELECT DISTINCT country FROM customers) c) AS countries,
       min(created_at) AS first_signup,
       max(created_at) AS last_signup
FROM customers;
