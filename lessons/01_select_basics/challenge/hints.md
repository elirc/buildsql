## Hint 1
This is exercise 3 again, but the "column pair" is (category, color), and
color has to be pulled out of the JSONB first. DISTINCT applies to the whole
selected row, so selecting both columns after DISTINCT dedups the pairs.

## Hint 2
Skeleton:

```sql
SELECT DISTINCT category, <jsonb expression> AS color
FROM products;
```

The README gives you the exact JSONB expression for extracting `color`.

## Hint 3
The JSONB expression is `attributes ->> 'color'`. Put it second in the
DISTINCT select list. That's the whole query — assemble it.
