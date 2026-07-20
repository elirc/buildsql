## Hint 1
Three pieces: (a) a CTE with the 30-day calendar from generate_series;
(b) a CTE with the DISTINCT days customer 4242 has events (`ts::date` or
`date_trunc`); (c) calendar LEFT JOIN activity, keep rows where the
activity side IS NULL.

## Hint 2
```sql
WITH calendar AS (
    SELECT gs::date AS day
    FROM generate_series('2023-10-15'::date, '2023-11-13'::date,
                         interval '1 day') AS gs
),
active AS (
    SELECT DISTINCT ts::date AS day
    FROM events
    WHERE customer_id = 4242
)
SELECT c.day
FROM calendar c
LEFT JOIN active a ON a.day = c.day
WHERE a.day IS NULL
ORDER BY c.day;
```
