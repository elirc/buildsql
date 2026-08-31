## Hint 1

Write both unions out. `sku` is then one template literal - note the order:
colour first, then size.

`parseSku` is the interesting half: it receives a `string`, and a `string` is not
a `Size` no matter how much it looks like one.

## Hint 2

Reject the wrong number of parts first (`split("-")` then a length check), so
neither half can be `undefined`.

Then compare each half against its literals with a chain of `!==`. After those
comparisons the values are narrowed, and the object literal typechecks with no
cast at all - which is the point. `size as Size` would compile and would let
`"xl"` through.

Left to you: `!==` chains, or a lookup in an `as const` list plus a predicate.
The second scales past three values; the first is obvious at a glance.
