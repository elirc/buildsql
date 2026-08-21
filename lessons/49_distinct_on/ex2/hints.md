## Hint 1
One row per department again — this time the *most recently hired* person.
Same tool, `DISTINCT ON (department)`; only the sort direction changes.

## Hint 2
Most recent means the largest `hired_on`, so sort it descending. The
`DISTINCT ON` expression still has to be the first thing in `ORDER BY`:

```sql
SELECT DISTINCT ON (department) department, name, hired_on
FROM staff
ORDER BY department, hired_on DESC ...;
```

## Hint 3
`ORDER BY department, hired_on DESC, id` — department first (required),
`hired_on DESC` so the newest hire is the first row kept, `id` as a tie-break.
