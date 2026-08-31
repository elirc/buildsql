## Hint 1

`never` as a return type is a promise that the function does not finish
normally. Write it on `fail` and the compiler will let you call it where a
value of any type is expected, and will treat the code after it as dead.

## Hint 2

In `requirePort`, convert the string case first and then validate once. After
an `if` block that ends in a call to `fail`, the compiler narrows the value to
`number` for the `return` below - no cast, no non-null assertion.

## Hint 3

Order the conditions so each one is legal: `typeof value !== "number"` has to
come before any comparison, because `<` on an `unknown` is an error. The `||`
chain narrows as it goes, which is what makes the later operands compile.

Left to you: whether `requirePort` should accept `"8080\n"`. Trimming says yes;
a stricter reading of the prompt says nothing at all about newlines.
