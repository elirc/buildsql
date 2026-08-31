## Hint 1

You already know how to peel the head off a tuple (d16 ex3). Do that, then
build a template out of the head, the delimiter, and the joined rest.

## Hint 2

The delimiter goes *between* parts, so the one-element case needs its own
branch - otherwise `Join<["a"], ",">` comes out `"a,"`. Ask whether the
remainder is the empty tuple.

## Hint 3

A capture used inside a template has to be known to be a string, or the
compiler refuses the placeholder. `infer Head extends string` states that
constraint in the pattern itself, which is cleaner than a nested conditional.

Left to you: whether to special-case one element or to special-case the empty
remainder. They are the same check written from opposite sides; pick the one
you can explain.
