## Hint 1

The pattern goes in the `extends` clause: describe the shape you expect, and
put `infer E` where the part you want lives.

## Hint 2

Match against `readonly (infer E)[]` rather than `(infer E)[]`, for the same
reason as d15 ex1 - the readonly form is the weaker requirement, so it also
matches mutable arrays and tuples.

Left to you: whether the false branch is `never` or `T`. The prompt picks one;
the other is what `Flatten` in ex5 will want.
