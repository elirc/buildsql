## Hint 1
Three aliases of `staff`. The second join hangs off the *manager* hat,
not the employee hat: `JOIN staff g ON g.id = m.manager_id`.

## Hint 2
`FROM staff e JOIN staff m ON m.id = e.manager_id JOIN staff g ON g.id = m.manager_id`
