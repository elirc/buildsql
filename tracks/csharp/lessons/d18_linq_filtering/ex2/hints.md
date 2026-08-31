## Hint 1

All four are one-liners built from `Any`, `All` and `Count`, each of which
takes an optional predicate. `Any` also has a parameterless form that just asks
"is there anything here".

Before you write them, answer this on paper: for an empty sequence, what does
`Any(...)` say, and what does `All(...)` say? They do not agree.

## Hint 2

`Any` on an empty sequence is **false** - it needs an element that satisfies
the predicate, and there is none. `All` on an empty sequence is **true** - it
needs no element that breaks the rule, and there is none of those either. That
is not a quirk; it is the same convention maths uses, and it is why
`orders.All(o => o.Total > 0)` passes cheerfully for a customer with no orders.

Prefer `Any()` to `Count() != 0`: `Any` stops at the first element while
`Count` walks the whole sequence to answer a question the first element already
settled.

`CountBetween` is inclusive at both ends, so both comparisons need the equals
sign.
