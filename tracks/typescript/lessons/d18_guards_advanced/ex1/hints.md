## Hint 1

A type predicate is written in the return position: `values is <the narrower
type>`. The narrower type here is a tuple with one required element and a rest.

## Hint 2

`[T, ...T[]]` is assignable to `T[]`, which is the rule a predicate has to obey:
you may only narrow to a subtype of the declared parameter type.

The body is one comparison. Resist writing `!!values.length` - it is the same
check with the reasoning removed.

Left to you: `values.length > 0` or `values.length !== 0`. Identical here; one
of them still reads correctly if `length` is ever a floating-point number.
