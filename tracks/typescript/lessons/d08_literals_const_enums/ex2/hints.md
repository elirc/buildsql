## Hint 1

`as const` on the array turns it into a readonly tuple of three literal types.
Then `(typeof SHORTCUTS)[number]` indexes that tuple by every numeric index at
once, which unions the three literals together.

Write the type as *derived*, never as a second hand-written union.

## Hint 2

`SHORTCUTS.includes(value)` will not compile once the array is a tuple of
literals: `includes` wants an argument of the element type, and `value` is a
plain `string`.

One widening cast is the accepted answer:

```ts
(SHORTCUTS as readonly string[]).includes(value)
```

Left to you: that cast, or `SHORTCUTS.some((s) => s === value)`. Both work; one
of them needs no comment to justify.
