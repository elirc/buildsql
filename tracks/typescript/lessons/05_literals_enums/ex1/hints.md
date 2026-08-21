## Hint 1

`Level` is currently `string`, which means `"banana"` is a level and the
compiler has no way to disagree. The type you want has exactly three values in
it, and you already know how to say "one of these" from lesson 04 - the only
new part is that the members are strings rather than object types.

## Hint 2

A string literal is a type whose only value is that string:

```ts
type Answer = "yes" | "no";
```

Once `Level` says that, `switch (level)` narrows exactly as a discriminated
union did, `case "beginer"` (note the typo) becomes a compile error, and the
gate's `nextLevel("expert")` stops compiling.

The top of the ladder does not go anywhere. The README says where it stays.

## Hint 3

Declare `type Level = "beginner" | "intermediate" | "advanced"` and switch over
the three cases: beginner to intermediate, intermediate to advanced, advanced
to advanced.

Left to you: whether to write the last case at all, or to end with a `default`.
One of those two makes TypeScript prove you covered everything - and lesson 04
already showed you the trick.
