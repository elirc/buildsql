## Hint 1
`'books'` is not a position in the catalogue — it is 1,678 rows. A cursor
that remembers only the category can express "after every book", which
jumps clean over the 1,658 books that page 2 and the eighty pages behind it
were meant to show. The cursor has to name the *row* you stopped at, and it
takes both columns of the sort key to do that: the category, and the id
that broke the tie inside it.

## Hint 2
SQL compares row values lexicographically, exactly the way `ORDER BY a, b`
orders them: `(a1, b1) > (a2, b2)` is true when `a1 > a2`, or when the `a`s
are equal and `b1 > b2`. That single comparison is the whole cursor. The
`last_seen` CTE returns one row, so you can put it in the `FROM` list next
to `products` and reference its columns.

## Hint 3
```sql
...
FROM products p, last_seen c
WHERE (p.category, p.id) ... (c.category, c.id)
```
Fill in the comparison, then finish the query: the `SELECT` list is `id`,
`category`, `name`, and the `ORDER BY` and `LIMIT` must still describe the
same page shape the reference does. A keyset query whose `ORDER BY` does not
match its cursor is a bug that only shows up on page two.
