## Hint 1

Distribution is triggered by a *naked* type parameter on the left of
`extends`. So stop it from being naked.

## Hint 2

Wrapping both sides in a one-element tuple - `[T] extends [U]` - asks the same
assignability question about a type the compiler will not split apart. The
`never` case proves it worked: `never[]` rather than `never`.

Left to you: tuples are the usual wrapper, but any position that is not the
bare parameter works. Try one and see whether it still reads.
