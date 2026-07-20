## Hint 1
The year of a timestamp: `extract(year FROM created_at)` (lesson 18 makes
this official; that's the whole preview you need). Count-with-CASE:
`count(CASE WHEN ... THEN 1 END)` — CASE without ELSE yields NULL, and
count skips NULLs. Or `sum(CASE ... THEN 1 ELSE 0 END)`.

## Hint 2
```sql
SELECT country,
       count(CASE WHEN extract(year FROM created_at) = 2022 THEN 1 END) AS y2022,
       count(CASE WHEN extract(year FROM created_at) = 2023 THEN 1 END) AS y2023
FROM customers
GROUP BY country;
```

(`count` of no matches is 0, so the "must show 0" requirement is free.)
