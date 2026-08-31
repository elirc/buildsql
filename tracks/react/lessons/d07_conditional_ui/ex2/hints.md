## Hint 1
Run the stub in your head with `count` set to 0. `&&` does not return a
boolean - it returns one of its operands, and here that operand is the number
zero.

## Hint 2
React refuses to render `false`, `null` and `undefined`, and renders
everything else it is given, including `0` and `NaN`. Make the left-hand side
of the condition an actual comparison, or use a ternary that ends in `null`.
