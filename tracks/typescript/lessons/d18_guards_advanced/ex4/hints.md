## Hint 1

`asserts value is Row` in the return position means "if this returns at all,
`value` is a `Row`". There is no boolean to return - the only two outcomes are
returning and throwing.

## Hint 2

Check the container first: `typeof value === "object"`, not `null`, not an
array. Only then can you read fields off it, and you will need one cast to a
`Record<string, unknown>` to do so - that cast is safe precisely because of the
check above it.

Left to you: one message per field, or one message listing everything wrong.
The gate only requires the failing field's name to appear; ex4 of lesson 10's
challenge argued for collecting them all.
