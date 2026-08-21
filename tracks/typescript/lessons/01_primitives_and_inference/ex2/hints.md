## Hint 1

`number[]` says "some numbers, any amount, in any position". That is not what
you are returning: you are returning exactly two numbers, and the first one
means something different from the second. TypeScript has a type for exactly
that shape, and the README's Concept section names it.

## Hint 2

The annotation you want looks like an array literal in type position:

```ts
function example(): [string, boolean] {
  return ["yes", true];
}
```

You may label the slots - `[min: number, max: number]` - which changes nothing
for the compiler and a great deal for the next person to read it.

For the body: one pass over `values`, tracking two running numbers. Seed them
from `values[0]`, not from `0` or `Infinity` guesses.

## Hint 3

Declare `: [min: number, max: number]`, seed both accumulators from the first
element, loop once comparing each value against both, and return them as an
array literal in min-then-max order.

Still yours to decide: whether to loop by hand or lean on `Math.min(...values)`.
One of those two has a hard limit on how many arguments it can spread - worth
knowing which before you reach for it in production.
