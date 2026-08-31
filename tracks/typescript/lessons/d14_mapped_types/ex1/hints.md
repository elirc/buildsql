## Hint 1

Map every key and widen every value: the union operator works inside a mapped
type's value position just as it does anywhere else.

## Hint 2

`{ [K in keyof T]: T[K] | null }`. Do not reach for `?` - "may be absent" and
"is present but null" are different contracts, and the gate compares exactly.
