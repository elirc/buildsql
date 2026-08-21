## Hint 1

Nothing about taking the first element of a list depends on what the elements
are. That is the definition of a generic function: one implementation, a type
that varies with the call.

Then there is the empty list. Whatever you return for it has to be part of the
declared return type.

## Hint 2

A type parameter is declared in angle brackets before the parameter list and
used like any other type:

```ts
function last<T>(items: readonly T[]): T | undefined { ... }
```

You do not pass `T` at the call site - TypeScript *infers* it from the
argument, so `first([1, 2])` gives `T = number`. That inference is the entire
ergonomic argument for generics over `unknown`.

## Hint 3

Write `first<T>(items: readonly T[]): T | undefined`, return `undefined` when
the list is empty, and `items[0]` otherwise.

Left to you: whether to write the body as a conditional expression or an early
return. And one thing worth trying: delete the `| undefined` and see what
TypeScript says about `items[0]` - the answer depends on a compiler flag this
course leaves off, and knowing which one is worth five minutes.
