## Hint 1

`keyof` and the indexed access type again, with one extra idea: the *value* you
are searching for should be typed by the key you chose. Ask for a `streak` and
the compiler should insist on a number.

## Hint 2

Three parameters, two type parameters: `items: readonly T[]`, `key: K` where
`K extends keyof T`, and `value: T[K]`.

`Array.prototype.find` returns `T | undefined`, which is exactly the return type
you want - no cast needed, and the caller is told about the miss.

## Hint 3

Write the signature as above with `T | undefined` out, and the body as
`items.find((item) => item[key] === value)`.

Left to you: `===` compares by reference for objects, so searching for an
object-valued property will not do what you hope. Whether that matters here
depends on the data - but noticing it before shipping is the skill.
