## Hint 1

Take the signature apart first: `F extends (...args: infer Args) => infer R`.
Now the problem is about `Args`, which is a tuple, and you already know how to
peel the head off one.

## Hint 2

Three cases. No parameters: hand back `() => R`. Exactly one: hand back
`(arg: First) => R`. More than one: hand back `(arg: First) => Curried<...>`,
where the inner type is a function taking the *remaining* parameters and
returning `R`.

## Hint 3

The recursive step has to rebuild a function type to recurse on -
`Curried<(...args: Rest) => R>` - because `Curried` takes a signature, not a
tuple. A version that recurses on the tuple directly is also possible; it needs
a second, differently shaped helper.

Left to you: how to tell "exactly one parameter" from "more than one". There is
a check on `Rest` that does it in one line, and there is also a way to restructure
so the question never comes up.
