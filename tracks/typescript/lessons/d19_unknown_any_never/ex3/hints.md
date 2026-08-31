## Hint 1

`never` has no values, so a parameter typed `never` can only be passed
something the compiler has already narrowed to nothing. In the `default` branch
of an exhaustive switch, that is exactly what the discriminant has become.

## Hint 2

The return type is `never` too, which is what lets the `default` branch say
`return assertUnreachable(shipment)` without upsetting the string return type
of the function around it.

The thrown message has to include the value - `String(value)` is enough, and
the gate checks for it. A value that "cannot happen" is exactly the value you
will want to see printed when it does.

Left to you: `return assertUnreachable(...)` or a bare call followed by
nothing. Both compile; one of them keeps working if the function is later
converted to an expression.
