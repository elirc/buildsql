## Hint 1
Two aggregates over `reviews`, one row: a rounded average and a row count.

## Hint 2
`SELECT round(avg(rating), 2), count(*) FROM reviews;`
