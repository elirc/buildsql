## Hint 1

Two grouping keys, one partition key. The partition is over one of the two things you grouped by, so each partition holds that category's colour rows.

## Hint 2

`GROUP BY category, attributes->>'color'`, then `sum(count(*)) OVER (PARTITION BY category)` for the category total. Grouping by a jsonb accessor works exactly like grouping by a column.
