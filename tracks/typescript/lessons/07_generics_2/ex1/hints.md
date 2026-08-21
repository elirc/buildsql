## Hint 1

Two promises are missing. The first: the key has to be a property that actually
exists on the elements - not any string in the world. The second: the values
that come back are whatever type that property holds, not `unknown`.

TypeScript has one operator for each half.

## Hint 2

`keyof T` is the union of `T`'s property names, and `T[K]` is the type stored
at key `K`:

```ts
interface Learner { id: string; streak: number }
type Keys = keyof Learner;        // "id" | "streak"
type Streak = Learner["streak"];  // number
```

The constraint `K extends keyof T` says "K is one of T's keys", and because `K`
is inferred from the *literal* you pass, `T[K]` is the exact type at that key.

## Hint 3

Signature: `pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][]`.
Body: `items.map((item) => item[key])`.

Left to you: try writing the second parameter as `key: keyof T` instead of the
constrained `K`. It compiles - and then work out what the return type has to be
and why that is worse for the caller.
