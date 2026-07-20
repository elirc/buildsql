CREATE VIEW top_spenders AS
SELECT customer_id, name, spend
FROM customer_spend
WHERE spend > 20000;
