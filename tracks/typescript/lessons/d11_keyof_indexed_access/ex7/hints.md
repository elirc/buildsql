## Hint 1

`Pick<T, K>` is the type of a row containing only the named members, so the
return type is `Pick<T, K>[]`. `K` is inferred from the array of keys, which is
why the call site never has to mention the row type.

## Hint 2

An object under construction cannot be declared as the finished type - `const
projected: Pick<T, K> = {}` is an error, because an empty object is not one yet.
`{} as Pick<T, K>` followed immediately by the loop that fills it is the
accepted answer.

Assigning in the order the keys were given is what makes `Object.keys` on the
result come out in that order.

Left to you: this loop, or `Object.fromEntries(keys.map(...))`. The second needs
a broader cast and loses the key literals - say which trade you prefer.
