## Hint 1

Two decisions live in this exercise and they are independent. The first is
arithmetic: an average is a sum divided by a count. The second is a type: what
does this function hand back to its caller, and where do you write that down?

Start with the empty array. `0 / 0` is `NaN` in JavaScript, and `NaN` fails the
gate's `toBe(0)` with a message that will not flatter you. Decide what happens
for an empty list before you write the general case.

## Hint 2

The body is a guard clause plus a loop (or a `reduce`, if you prefer - both are
fine here):

```ts
if (scores.length === 0) {
  // hand back the agreed-upon answer for "no scores"
}
```

For the type: the return annotation goes between the parameter list and the
opening brace, as `: SomeType`. Look at what the gate asserts with
`expectTypeOf(...).returns` and write exactly that.

## Hint 3

You need `: number` after `(scores: number[])`, a length check that returns
early, and a sum divided by `scores.length`. Do not round: `averageScore([1, 2])`
is `1.5`, and `toBe` compares with `===`.

The one thing still left to you is *how* you sum - a `for...of`, a classic
indexed `for`, or `scores.reduce(...)`. Pick one and read the inferred type
your editor shows you afterwards.
