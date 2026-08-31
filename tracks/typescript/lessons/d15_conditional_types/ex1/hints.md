## Hint 1

The two branches of a conditional type can be literal types. `true` and
`false` are types as well as values - that is the whole of lesson 05.

## Hint 2

The check has to admit `readonly` arrays and tuples too. A mutable `string[]`
is assignable to `readonly unknown[]`, and so is `[1, 2]`, so one constraint
covers all three - the other direction does not.

Left to you: `unknown` or `any` as the element type in that constraint. Both
work here; only one of them keeps `noImplicitAny` honest elsewhere.
