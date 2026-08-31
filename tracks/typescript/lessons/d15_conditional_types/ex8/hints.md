## Hint 1

Do not try to compare `X` and `Y` directly - every test you can write is one
`any` away from lying. Compare two *things built from* `X` and `Y` instead.

## Hint 2

Build a generic function type on each side whose return type is a conditional
mentioning the type under test: `<T>() => T extends X ? 1 : 2`. Neither
conditional can be resolved (nothing is known about `T`), so the compiler falls
back to comparing them as written - and they match only when `X` and `Y` are
the same type.

## Hint 3

Then the whole thing is one `extends` between those two function types, with
`true` and `false` as the branches. Watch the parentheses: the conditional in
the return position and the outer conditional are easy to tangle.

Left to you: this is a compiler-internals trick with no specification behind
it. Decide for yourself whether it belongs in a codebase you maintain, or only
in the tests that guard your utility types.
