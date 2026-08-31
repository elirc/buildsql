## Hint 1

The value position can hold any type expression, including a brand-new object
literal type. Mention `T[K]` inside it and each member keeps its own type.

## Hint 2

`{ [K in keyof T]: { value: T[K] } }`. If you prefer a named `Box<V>` helper,
that is fine too - the mistake to avoid is `Box<unknown>`, which cuts the
member's own type out of the box.
