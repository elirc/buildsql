## Hint 1

The table has to be frozen *and* checked - `as const satisfies ...` - or the
paths widen to `string` and every derived type collapses. That is d20 ex4 and
ex8, applied to an endpoint list.

## Hint 2

`(typeof ENDPOINTS)[K]["path"]` is the literal path for the endpoint `K`.
Feeding that into the same `PathParams` machinery as ex7 gives the params
object, and the generic `K` is what connects the two arguments to each other.

## Hint 3

Building the url is a `split`, a `map` and a `join`: a segment starting with `:`
is replaced by its value, everything else is kept. One cast to
`Record<string, string>` is needed to index the params object by a name the
compiler cannot see.

Left to you: whether the values should be `encodeURIComponent`d. They should -
and the gate does not check it, which is a reasonable illustration of what a
gate is and is not.
