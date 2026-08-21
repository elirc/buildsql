CREATE MATERIALIZED VIEW country_rev AS
SELECT c.country, sum(o.total) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status IN ('paid', 'shipped')
GROUP BY c.country;

CREATE UNIQUE INDEX country_rev_country_idx ON country_rev (country);
