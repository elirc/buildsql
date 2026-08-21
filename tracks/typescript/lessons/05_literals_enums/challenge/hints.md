## Hint 1

Writing `type Tier = "nudge" | "approach" | "almost"` by hand works right up
until someone adds a fourth tier to the object and forgets the type. Deriving
the union from the object means that cannot happen.

Two operators do it, and they read right to left.

## Hint 2

`typeof HINT_TIERS` in a *type* position means "the type of that value", and
`keyof` takes the union of a type's keys:

```ts
const sizes = { small: 1, large: 2 } as const;
type Size = keyof typeof sizes;   // "small" | "large"
```

The `as const` matters twice here: without it the keys are still right, but the
*values* widen to `number`, and the type gate checks one of them.

The sort is by the number each tier maps to, and lesson 01 already taught you
not to sort the caller's array.

## Hint 3

Add `as const`, replace the `Tier` alias with `keyof typeof HINT_TIERS`, and
sort a copy with a comparator that subtracts the two looked-up numbers.

Left to you: whether the comparator reads `HINT_TIERS[a] - HINT_TIERS[b]` or
something with an `if`. Also worth a minute: work out why the copy has to
happen before `.sort()` even though the parameter is `readonly` - the compiler
will tell you if you forget.
