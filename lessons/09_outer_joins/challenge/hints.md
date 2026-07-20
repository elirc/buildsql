## Hint 1
Two conditions, two homes: `c.country = 'MX'` is about the left table →
WHERE. `o.total > 1900` decides *what counts as a match* → into the ON,
ANDed with the join key.

## Hint 2
```sql
SELECT c.id, c.name, o.id, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 1900
WHERE c.country = 'MX';
```

Before submitting, move the total-filter to WHERE in the lab and compare
row counts — that's the entire lesson in one experiment.
