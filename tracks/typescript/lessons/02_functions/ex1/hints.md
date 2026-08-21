## Hint 1

Read the gate's first call: `progressLine(3)`. One argument, two parameters.
There are two ways to make that legal in TypeScript and only one of them gives
`total` a value to work with.

The number in the expected output tells you what that value is.

## Hint 2

A default parameter is written in the signature, exactly as in JavaScript:

```ts
function example(label: string, times = 3) { ... }
```

Two things happen at once. `times` becomes optional at the call site, and its
type is inferred from the default - so you do not annotate it as well.

The percentage is `Math.round(done / total * 100)`. Round, do not truncate:
one third is 33%, two thirds is 67%.

## Hint 3

Give `total` a default of `12`, build the string with a template literal, and
compute the percentage with `Math.round`. The exact shape is
`done/total (percent%)` - one space before the bracket, a literal `%` inside.

What is left to you: whether you write `total = 12` and let inference do the
rest, or `total: number = 12`. Both compile. Look at what
`expectTypeOf(progressLine).parameters` reports for each and decide which one
you would rather read in a review.
