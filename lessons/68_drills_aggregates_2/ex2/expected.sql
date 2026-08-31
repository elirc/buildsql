SELECT count(*) AS customers,
       count(DISTINCT country) AS countries,
       min(created_at) AS first_signup,
       max(created_at) AS last_signup
FROM customers;
