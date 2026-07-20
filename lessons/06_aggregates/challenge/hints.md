## Hint 1
Each of the four values is a complete one-value query wrapped in
parentheses, sitting in the SELECT list. There is no FROM clause at the
outer level at all.

## Hint 2
```sql
SELECT
  (SELECT count(*) FROM customers),
  (SELECT count(*) FROM orders),
  (SELECT sum(total) FROM orders WHERE status = 'paid'),
  (SELECT ... FROM reviews);
```

The last one is the rounded average rating from ex-review territory.

## Hint 3
The fourth subquery is `(SELECT round(avg(rating), 2) FROM reviews)`.
Assemble all four.
