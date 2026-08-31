## Hint 1

The stub only relabels values - the keys never move. A real inversion has to
put `T[K]` where the key goes, and the `as` clause is the only place a new key
can come from.

## Hint 2

Remap each key to its own value: `[K in keyof T as T[K]]`. That is legal here
because the constraint promises every value is a `PropertyKey` - remove the
constraint and the same line stops compiling.

## Hint 3

With the keys swapped, what is left for the value position? The old key: `{ [K
in keyof T as T[K]]: K }`. Left to you: check your type against the numeric
table in the gate and convince yourself why nothing extra was needed for
number-valued members.
