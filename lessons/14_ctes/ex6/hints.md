## Hint 1
Exercise 3's query with a different base case: `WHERE id = 2` instead
of `WHERE manager_id IS NULL`.

## Hint 2
The recursive step is unchanged: `JOIN subtree ON s.manager_id = subtree.id`,
with `subtree.depth + 1`.
