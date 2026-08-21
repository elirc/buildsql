## Hint 1

Same shape as ex2, different domain: three variants sharing one literal-typed
property, and one variant that carries no extra data at all. That last one is
worth noticing - a member of a discriminated union is allowed to be nothing but
its discriminant.

## Hint 2

The discriminant is called `method` here rather than `kind`. Nothing special
about either name; what matters is that every member has the property and that
each one types it as a different string literal.

`switch (payment.method)` then narrows in each `case`, so `payment.last4` is
available in exactly one branch.

## Hint 3

Three variants - `{ method: "cash" }`, `{ method: "card"; last4: string }` and
`{ method: "transfer"; iban: string }` - plus a `switch` returning the three
strings from the README.

Left to you: whether to add the `default: return assertNever(payment)` habit
from ex4. Nothing here needs it. Everything you write after this course does.
