## Hint 1

There is a modifier that can be written in front of a type parameter, and it
does at the call site what `as const` does at the value site.

## Hint 2

`<const T extends readonly unknown[]>` tells the compiler to infer `T` as if
the argument had been written with a const assertion. The constraint has to
allow readonly arrays, or the inferred type will not satisfy it.

Left to you: the body. Returning the argument is enough here - and worth
pausing on, because the entire behaviour of this function lives in its
signature.
