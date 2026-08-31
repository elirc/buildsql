SELECT count(*) AS orders,
       count(DISTINCT customer_id) AS buyers,
       round(count(*)::numeric / count(DISTINCT customer_id), 3) AS orders_per_buyer,
       round(sum(total)::numeric / count(DISTINCT customer_id), 2) AS revenue_per_buyer
FROM orders;
