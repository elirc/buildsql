## Hint 1

Fix the return type to `T[]` first. That is the whole reason the function is
generic: what went in is what comes out.

Then read the prompt again. This is not `filter` - it stops at the first element
the predicate rejects and never looks at the rest.

## Hint 2

A loop with an early `return` is the honest shape. `filter` cannot express
"stop", and every version built on it runs the predicate once per element -
which the call-count assertion in the gate will notice.

Left to you: `return taken` from inside the loop, or `break` and a single return
at the end. Identical here; one of them survives being wrapped in another loop.
