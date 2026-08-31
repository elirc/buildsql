## Hint 1

`Required<T>` removes the `?` from every member - the exact inverse of
`Partial<T>`. That is the return type, and once it is written the compiler will
tell you if any of the three members can still be missing.

## Hint 2

`draft.salary || 0` is right for `undefined` and wrong for a supplied `0`. So is
`draft.remote || false` for a supplied `false`, and `draft.title || "untitled"`
for a supplied `""`. The gate checks all three.

`??` fires for `null` and `undefined` and for nothing else.

Left to you: three `??` expressions in a fresh object, or a spread over a
defaults object. The second reads well and needs a moment of thought about what
a member explicitly set to `undefined` should do.
