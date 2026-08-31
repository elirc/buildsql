## Hint 1

The narrowed type has to mention the *generic* key: `value is Record<K, unknown>`.
That is what makes `value.total` readable after the check and `value.missing`
still an error.

## Hint 2

`in` walks the prototype chain and the gate builds an object with
`Object.create` to prove it. `Object.prototype.hasOwnProperty.call(value, key)`
does not - and calling it that way survives objects with a null prototype or a
property literally named `hasOwnProperty`.

Left to you: `Object.hasOwn` is the modern spelling of the same check. Look up
which runtimes have it before you decide.
