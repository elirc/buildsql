## Hint 1

Four topics: variadic tuple patterns (d16 ex3), recursive conditional types
(d16 ex5), `infer` in a function-type pattern (d16 ex2) and `Awaited` (d21 ex8).

## Hint 2

The recursion peels one step at a time: match
`readonly [(arg: never) => infer R, ...infer Rest]`, then recurse with
`Awaited<R>` as the new input type and `Rest` as the remaining steps. The base
case - the pattern failing to match, which happens when the tuple is empty - is
`T`.

## Hint 3

`(arg: never)` in the pattern and in the constraint is deliberate. Parameters are
contravariant, so a parameter type of `never` accepts a function taking anything
- which is what lets the constraint hold for every step regardless of what it
takes.

Left to you: this signature computes the result type but does not *check* that
each step accepts what the one before it produced. Work out what it would take
to enforce that as well, and decide whether the error messages would be worth it.
