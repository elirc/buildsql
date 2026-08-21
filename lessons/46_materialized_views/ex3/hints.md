## Hint 1
`CREATE MATERIALIZED VIEW country_rev AS <the query>;` then
`CREATE UNIQUE INDEX ... ON country_rev (country);`

## Hint 2
The query is lesson 08's revenue-by-country with a status filter:
`WHERE o.status IN ('paid','shipped') GROUP BY c.country`.
