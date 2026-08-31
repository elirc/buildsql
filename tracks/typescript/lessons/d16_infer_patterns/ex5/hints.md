## Hint 1

The stub is one step of the answer. What should happen to `E` before it is
returned - is it guaranteed not to be an array itself?

## Hint 2

Call the type from inside its own true branch. Recursion terminates because
every step removes one array layer, and the false branch - `T` unchanged - is
the base case that stops it.

Left to you: nothing about the shape, but do check `Flatten<{ id: string }[][]>`
in your head. The false branch has to return the object type intact.
