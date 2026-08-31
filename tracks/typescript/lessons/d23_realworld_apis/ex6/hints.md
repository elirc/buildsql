## Hint 1

A rest parameter's type is a tuple, and a tuple can be produced by a conditional
type. `...rest: M extends "GET" ? [] : [body: string]` is a legal parameter
list, and the empty tuple means "no more arguments".

## Hint 2

`M` is inferred from the first argument, so the conditional is resolved before
the rest parameter is checked - which is why passing `"GET"` makes the third
argument an error rather than a mismatch.

## Hint 3

Inside the body, `rest` is still the unresolved conditional as far as the
compiler is concerned, so destructuring it needs one assertion. That is a known
limit: the implementation cannot see the branch the caller took.

Left to you: whether to distinguish a missing body from an empty one. The gate
requires `""` to be treated as present, so `body === undefined` is the check,
not `body`.
