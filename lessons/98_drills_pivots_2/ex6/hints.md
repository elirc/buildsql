## Hint 1

The same join as ex4, with the roles of the two dimensions swapped: the
rating becomes the grouping key and the category becomes the column list.

## Hint 2

`GROUP BY r.rating`, then six `count(*) FILTER (WHERE p.category = '...')`
columns in alphabetical order. Five rows out, because there are five ratings.
