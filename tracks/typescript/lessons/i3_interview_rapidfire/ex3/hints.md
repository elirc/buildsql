## Hint 1

Two `any`s and a `string` key: every promise this signature could make, it has
declined to make. The version you want is the one from lesson 07 - an element
type and a key constrained to that element's keys.

And it returns a *new* array, because the input is `readonly`.

## Hint 2

```ts
function sortByKey<T, K extends keyof T>(items: readonly T[], key: K): T[] { ... }
```

The comparator receives two `T`s, reads `a[key]` and `b[key]`, and returns a
negative number, zero, or a positive one. `<` works for both strings and numbers,
which is why this can stay generic without a constraint on `T[K]`.

Copy before sorting - and note that with a `readonly` parameter the compiler
will not let you forget.

## Hint 3

Spread into a new array, `.sort()` with a comparator that returns `0` when the
values are equal and otherwise `-1` or `1` from a `<` comparison.

Left to you: `sort` is stable in modern JavaScript engines, so equal elements
keep their relative order - which is why returning `0` rather than guessing is
the right move. Being able to say "stable since ES2019" is a nice detail.
