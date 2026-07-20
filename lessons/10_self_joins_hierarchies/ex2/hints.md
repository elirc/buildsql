## Hint 1
Join staff to staff on same department, restrict both sides to finance
(one equality in ON or WHERE does it, since the ON already forces equal
departments), and apply the pairs trick from the concept section.

## Hint 2
```sql
SELECT a.name, b.name
FROM staff a
JOIN staff b ON a.department = b.department AND a.id < b.id
WHERE a.department = 'finance';
```

Why does `a.id < b.id` also guarantee "lower id first" in the output?
