## Hint 1

`ElementOf<T>` answers one question: "if `T` is an array, what is in it -
otherwise, what is `T`?". A question with two answers is a conditional type,
and the "what is in it" part needs a placeholder the compiler fills in for you.

The function then flattens one level, which is the runtime version of the same
question asked per item.

## Hint 2

```ts
type Unwrapped<T> = T extends Promise<infer V> ? V : T;
```

`infer V` declares a type variable *inside* the pattern; if the match succeeds
`V` is bound to whatever fits there. For arrays the pattern is
`readonly (infer U)[]`, which also matches mutable arrays - the readonly form is
the wider one, exactly as in lesson 01.

At runtime, `Array.isArray(item)` is the check, and spreading pushes several
values at once.

## Hint 3

`ElementOf<T>` is `T extends readonly (infer U)[] ? U : T`. The body walks
`items`, spreading arrays into the accumulator and pushing everything else.
Two casts are needed because `Array.isArray` cannot narrow an unresolved `T`;
keep them local and obvious.

Left to you: whether a nested array *inside* a nested array should be flattened
too. The name says once. `Array.prototype.flat` takes a depth argument for
exactly this reason - and its type signature is worth hovering.
