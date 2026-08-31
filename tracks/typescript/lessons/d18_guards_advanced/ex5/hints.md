## Hint 1

`Extract<Task, { kind: K }>` is the union member whose discriminant is `K`.
That is the return element type; the parameter `K` is constrained to
`Task["kind"]` so a typo is a compile error.

## Hint 2

`Array.prototype.filter` has an overload that takes a type predicate and
returns the narrowed element type. Writing the callback as
`(task): task is Extract<Task, { kind: K }> => task.kind === kind` is what
selects it.

Left to you: whether to hand-roll the loop instead. A `for` loop with a push
needs no predicate at all - but it does need you to say what it returns, and
that is the same expression either way.
