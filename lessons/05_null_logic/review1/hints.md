## Hint 1
Two ANDed conditions: department equals `'finance'`, and `manager_id` is
not NULL (the correct NULL test, not `<>`).

## Hint 2
`WHERE department = 'finance' AND manager_id IS NOT NULL` — wrap with
`SELECT id, name FROM staff`.
