## Hint 1

The predicate you have to write is on the *returned* function, not on
`everyIs` itself. A function type may carry a predicate:
`(values: readonly T[]) => values is readonly S[]`.

## Hint 2

Write the returned arrow with that return type spelled out. TypeScript will not
infer a type predicate for you - inference gives `boolean`, which is the stub.

## Hint 3

`S extends T` is what makes the narrowing legal: you may only narrow to a
subtype of what was declared. Drop the constraint and the compiler will
complain about the predicate rather than about the constraint, which is a
confusing place to start debugging.

Left to you: `values.every((value) => guard(value))` or `values.every(guard)`.
Both work; one of them changes meaning if `guard` ever grows a second
parameter.
