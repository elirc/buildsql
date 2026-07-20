## Hint 1
Per-category top-5 means each product row must be tested against *its own
category's* leaderboard. A subquery in the WHERE clause can see the current
outer row — that's called a correlated subquery. Ask: "is my id in the top-5
ids of my category?"

## Hint 2
The shape:

```sql
SELECT category, name, price
FROM products p
WHERE p.id IN (
    SELECT p2.id
    FROM products p2
    WHERE p2.category = p.category
    ORDER BY p2.price DESC, p2.id ASC
    LIMIT 5
)
ORDER BY ...;
```

The inner query re-ranks the *current row's* category each time.

## Hint 3
The only piece missing above is the outer ORDER BY — the prompt specifies
`category ASC, price DESC, id ASC`. Assemble and run it. (Yes, it's slow —
10,000 correlated sorts. Lesson 15 fixes the elegance, Part 5 the speed.)
