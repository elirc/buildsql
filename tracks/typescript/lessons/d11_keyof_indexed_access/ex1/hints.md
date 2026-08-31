## Hint 1

`T[K]` is the type stored at key `K`. That is the return type, and once it is
written the body is a single `return source[key]`.

## Hint 2

Notice what `K extends keyof T` is doing besides validation: it keeps the key
*literal*, so `getValue(item, "qty")` infers `K = "qty"` rather than widening to
`string`. Widen it and `source[key]` stops compiling.

Left to you: nothing much here - which is the point. Be able to write this
signature from memory, because half the utilities you will ever type start with
it.
