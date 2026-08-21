## Hint 1

Two separate things are being tested and they fail for different reasons.
First, the *offset*: Node always puts the executable and the script path at
the front of `process.argv`, so the user's first argument is at index 2.
Second, the *type*: everything in `argv` is a string, and adding strings
concatenates them.

Do the slicing before you do any arithmetic and both problems stay small.

## Hint 2

`Array.prototype.slice(2)` gives you a new array with the first two entries
dropped — it does not mutate the original, which matters because callers
usually pass `process.argv` itself.

To add up what is left you can use a `for...of` loop with an accumulator, or
`reduce`. Convert each entry with `Number(...)` (or `Number.parseFloat`) as
you go; the gate includes `"0.5"`, so an integer-only parse will be wrong.

## Hint 3

The shape is:

```ts
return argv.slice(/* how many to drop? */).reduce(
  (total, arg) => total + /* convert arg to what? */,
  /* what does the sum start at? */,
);
```

Three small decisions left. Check the empty case in your head before you run
the gate: with no user arguments, `reduce` never calls your callback, so the
answer is whatever you passed as the initial value.
