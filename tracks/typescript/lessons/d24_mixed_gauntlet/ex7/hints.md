## Hint 1

Three topics: discriminated unions (d07), `never` as an exhaustiveness check
(d19) and `readonly` types (d20). Make the state readonly first - it will tell
you every place you were about to mutate.

## Hint 2

Every branch returns a new object. `map` for a change in place, `filter` for a
removal, a spread for an append - and `return state` unchanged is a legitimate
answer for the two no-op cases.

## Hint 3

`assertNever` takes `never` and returns `never`. Returning its result from the
`default` branch is what tells the compiler the switch is total; if you later
add a fifth event type, that line is where the build breaks.

Left to you: whether `quantity` on an unknown sku should insert instead of doing
nothing. The prompt says do nothing; the other reading is defensible and is a
different event.
