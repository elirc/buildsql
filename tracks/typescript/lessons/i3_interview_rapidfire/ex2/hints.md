## Hint 1

Four levels, two branches, and a `default` that hides the gap. Same shape as
i1 ex2 with a literal union instead of a discriminated one - narrowing works
identically, because a literal union *is* a union of one-value types.

## Hint 2

Add the two missing cases, then replace the catch-all with a call to a helper
typed `assertNever(value: never): never`. In an exhaustive switch the default is
narrowed to `never`, so it compiles; miss a case and the error names the level
you forgot.

The badges are one to four asterisks, in level order. The README has them.

## Hint 3

`case "advanced": return "***";`, `case "master": return "****";`, and
`default: return assertNever(level);` with the helper declared above.

Left to you: whether `levelBadge` should return a literal union type
(`"*" | "**" | "***" | "****"`) rather than `string`. It costs nothing and tells
every caller more - which is the argument this whole track has been making.
