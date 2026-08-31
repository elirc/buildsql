## Hint 1

Write the union first: a cell is text, a number, a boolean, or nothing.

Then write the rules in an order where each one may assume the earlier ones did
not match. Empty comes first, because every other rule would have to re-check
it.

## Hint 2

Trim each field once into a local. `Boolean(text)` is not the boolean test you
want - it says `true` for the text `"false"`. Compare against the two exact
strings instead.

For the numeric rule, `Number.isFinite(Number(text))` is the guard;
`Number("")` is `0`, which is why the empty case had to go first.

Left to you: `map` over the split fields, or a loop pushing into an accumulator.
The `map` version infers the union for you if the arrow returns from every path.
