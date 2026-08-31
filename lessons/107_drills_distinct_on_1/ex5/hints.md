## Hint 1

The group key is computed - date_trunc('month', ...) - and the selection rule runs the other way from every "latest" exercise: earliest first.

## Hint 2

DISTINCT ON (date_trunc('month', created_at)) ... ORDER BY date_trunc('month', created_at), created_at ASC, id ASC, with the 2023 window in WHERE. ASC picks the first order of the month; id breaks a same-second photo finish.
