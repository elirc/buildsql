## Hint 1

An index signature is the opposite of a registry: it says "any key, and I know
nothing about the value". Replace it with real members contributed by separate
declarations of the same interface.

## Hint 2

Once the registry has literal keys, `keyof` gives you the command names and
`CommandRegistry[K]` gives you the matching payload - so the generic parameter
does all the checking with no runtime code involved.

## Hint 3

The body needs one assertion. Indexing a handler table by `K` gives the union of
every handler type, and the compiler cannot see that the handler you got matches
the payload you were given - a correlated-union limitation, not a mistake on
your part.

Left to you: a handler table or a `switch`. The table keeps the registry and the
implementations next to each other; the switch narrows `name` but not `payload`,
which is worth trying so you can see why.
