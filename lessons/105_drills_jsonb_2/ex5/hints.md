## Hint 1

You cannot group by an array element until each element is its own row. Lesson 19's challenge used the function that does exactly that.

## Hint 2

Put jsonb_array_elements_text(attributes -> 'tags') in the FROM clause next to products - a set-returning function there may reference the table's columns - then it is an ordinary GROUP BY over the exploded rows, with the category filter unchanged.
