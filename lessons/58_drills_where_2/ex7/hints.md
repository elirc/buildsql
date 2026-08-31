## Hint 1
Two independent rules, each with its own category and its own price
threshold. Build each one separately, then join them.

## Hint 2
```sql
WHERE (<rule one>)
   OR (<rule two>)
```

Here precedence would actually give you the right answer without brackets,
because `AND` binds tighter. Write them anyway - the reader cannot tell that
you knew.
