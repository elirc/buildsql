SELECT count(DISTINCT customer_id) AS buyers,
       count(DISTINCT customer_id) FILTER (WHERE status = 'paid') AS paid_buyers,
       count(DISTINCT customer_id) FILTER (WHERE status = 'cancelled') AS cancel_buyers,
       count(DISTINCT customer_id) FILTER (WHERE total > 1900) AS whale_buyers
FROM orders;
