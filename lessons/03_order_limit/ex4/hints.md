## Hint 1
`ORDER BY manager_id NULLS FIRST` — the modifier goes after the sort
key (and after `ASC`/`DESC` when you write one).

## Hint 2
`ORDER BY manager_id ASC NULLS FIRST, id ASC LIMIT 10`
