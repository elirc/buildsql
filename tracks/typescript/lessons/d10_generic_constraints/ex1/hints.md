## Hint 1

A constraint says what the body may read. Write down exactly the member you
touch and nothing more: `T extends { amount: number }`.

Structural typing does the rest - an item with three other members still
satisfies it.

## Hint 2

The body is an accumulator seeded at `0`, so the empty case needs no branch.

Left to you: whether this function needs a type parameter at all.
`(items: readonly { amount: number }[]) => number` accepts the same arguments -
be able to say what the generic version buys, and what it does not.
