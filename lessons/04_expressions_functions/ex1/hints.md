## Hint 1
Three plain columns plus one CASE expression with two WHENs and an ELSE.
The boundaries: "under 50", "under 200", "everything else". CASE stops at
the first true branch.

## Hint 2
```sql
SELECT id, name, price,
       CASE
         WHEN price < 50  THEN 'budget'
         WHEN price < 200 THEN 'mid'
         ELSE 'premium'
       END AS tier
FROM products;
```

Check the boundary semantics against the prompt before pasting — is 50
'budget' or 'mid'? Is 200 'mid' or 'premium'?
