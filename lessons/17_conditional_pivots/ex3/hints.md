## Hint 1
Three `count(*) FILTER (WHERE ...)` aggregates over one `GROUP BY
department`. The bands are half-open, exactly like lesson 04's CASE ladder.

## Hint 2
`count(*) FILTER (WHERE salary >= 60000 AND salary < 100000) AS mid`
