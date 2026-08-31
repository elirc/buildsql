## Hint 1

`?` is a modifier, and modifiers can be *removed* in a mapped type, not only
added. The minus sign is the tool - lesson 09's Concept section opened with it.

## Hint 2

`-?` after the bracket strips the optional marker: `{ [K in keyof T]-?: T[K] }`.
Without the minus the map is homomorphic and faithfully preserves every `?`
you meant to delete.
