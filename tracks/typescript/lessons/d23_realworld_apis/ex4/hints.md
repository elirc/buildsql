## Hint 1

`CamelKeys` is a key remap: `[K in keyof T as <new key>]`. The new key is a
recursive template-literal type that consumes one underscore per step and
capitalises the rest - d17 ex7 is the same type in isolation.

## Hint 2

`keyof T` includes `string | number | symbol` in general, and a template literal
type only accepts a string. Intersecting with `string` - `K & string` - is the
usual way to say "the string keys, as strings".

## Hint 3

`toUser` is deliberately hand-written rather than generic. The date is the
reason: the renaming is mechanical, the `string` to `Date` conversion is not,
and a mapper that pretends otherwise is where dates start arriving as strings in
production.

Left to you: whether `User` should be declared as `CamelKeys<UserDto>` with the
date overridden. It can be - and doing so ties the domain model to the wire
format, which is a trade rather than an improvement.
