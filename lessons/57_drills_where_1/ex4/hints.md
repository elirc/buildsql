## Hint 1
Two acceptable values for one column. `IN` takes a comma-separated list
of literals in brackets.

## Hint 2
```sql
WHERE department IN (<value>, <value>)
```

The long-hand version is an `OR` of two equalities - worth writing once so
you can see they are the same predicate.
