## Hint 1

Two one-line conditional types and one runtime filter. `MyNonNullable<T>` drops
`null` and `undefined` from a union; `MyReturnType<F>` pulls the result type out
of a function type.

Both are in the standard library, and writing them from memory is a common
whiteboard question.

## Hint 2

The first distributes over the union because the checked type is a naked type
parameter, and `never` disappears from a union:

```ts
type MyNonNullable<T> = T extends null | undefined ? never : T;
```

The second needs `infer` in the return position of a function pattern.

For `compact`, a plain `filter` gives you back `T[]` - the predicate proves
nothing to the compiler. A *type guard* predicate does:
`(item): item is MyNonNullable<T> => ...`.

## Hint 3

`MyNonNullable<T>` is the conditional above; `MyReturnType<F>` is
`F extends (...args: never[]) => infer R ? R : never`. `compact` filters with a
guard predicate that rejects `null` and `undefined`.

Left to you: `item != null` with the loose `!=` excludes both in one check.
Style guides differ on whether that is clever or sloppy - have an opinion ready.
