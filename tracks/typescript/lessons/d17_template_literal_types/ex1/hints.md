## Hint 1

A template literal *type* is written with backticks, exactly like the value
form, and `${...}` holds a type instead of an expression.

## Hint 2

Both parameters need `extends string`, or the compiler will not let them into
the template - `${T}` requires something it knows how to stringify.

Left to you: nothing about the shape. Do check what happens with a union in
both positions at once, though, and count the results before you look.
