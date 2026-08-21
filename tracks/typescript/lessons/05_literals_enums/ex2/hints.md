## Hint 1

Hover `TRACK_TITLES.typescript` in your editor. It says `string`, because
object properties are mutable and TypeScript widens their inferred types
accordingly. The gate wants it to say `"TypeScript"` - the literal - and it
wants an assignment to it to be rejected.

There is a two-word suffix that does both.

## Hint 2

`as const` is a *const assertion*. Applied to an object or array literal it
does two things at once: every property becomes `readonly`, and every literal
value keeps its literal type instead of widening.

```ts
const sizes = { small: 1, large: 2 } as const;
// sizes.small is 1, not number; sizes is readonly
```

The function body is then a single lookup with a computed key.

## Hint 3

Add `as const` after the closing brace of the object, and implement `titleOf`
as `return TRACK_TITLES[track];`.

That indexing works because `track` is one of the three literal keys and the
object has all three - which is the quiet payoff of literal types. Left to
you: what happens if you widen the parameter to `string`. Try it, read the
error, and you will understand index signatures better than the error message
does.
