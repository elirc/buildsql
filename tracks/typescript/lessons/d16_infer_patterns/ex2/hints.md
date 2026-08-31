## Hint 1

Write the pattern as a function type with the shape you want to match: one
named parameter carrying the `infer`, then a rest parameter to absorb whatever
else the function takes.

## Hint 2

The rest parameter's element type matters. Parameters are compared
contravariantly, so a rest element of `never` accepts every remaining
parameter list, while a narrower one quietly rejects functions that take a
second argument.

Left to you: what the zero-parameter case should do. The prompt fixes the
answer; find out whether you have to write anything at all to get it.
