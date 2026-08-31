## Hint 1
Without brackets, `AND` binds tighter than `OR`, so the total test would
attach to only the second status.

## Hint 2
```sql
WHERE (<status test> OR <status test>)
  AND <total test>
```

If your result contains expensive shipped orders, you have just met the
precedence bug from lesson 02 - the brackets are missing.
