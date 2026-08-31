SELECT count(DISTINCT customer_id) AS buyers,
       count(DISTINCT CASE WHEN status = 'paid' THEN customer_id END) AS paid_buyers,
       count(DISTINCT CASE WHEN status = 'cancelled' THEN customer_id END) AS cancel_buyers,
       count(DISTINCT CASE WHEN total > 1900 THEN customer_id END) AS whale_buyers
FROM orders;
