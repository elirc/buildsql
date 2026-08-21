## Hint 1

A conditional type whose checked type is a *naked* type parameter is applied to
each member of a union separately, and the results are unioned back together.
That is called distribution, and all three aliases here are about it: two of
them differ only in whether it happens.

Write `MyExclude` first - it is the one the runtime function uses.

## Hint 2

```ts
type MyExclude<T, U> = T extends U ? never : T;
```

Read it with `T = "a" | "b" | "c"` and `U = "b"`: the check runs three times, and
the `"b"` branch produces `never`, which vanishes from a union. That is how
subtraction falls out of a conditional.

To *stop* distribution, wrap both sides in a one-element tuple:
`[T] extends [U] ? ... : ...`. `[T]` is no longer a naked type parameter, so the
union is compared as a whole.

## Hint 3

`MyExclude<T, U>` is `T extends U ? never : T`. `BoxEach<T>` is
`T extends unknown ? T[] : never` (distributes, so a union of types becomes a
union of arrays). `BoxAll<T>` is `[T] extends [unknown] ? T[] : never` (does
not, so you get one array of the union).

The function filters out anything in `remove`; a `Set` keeps it one pass, and
one cast on the way out tells the compiler what your filter proved.

Left to you: whether that cast is honest. `filter` cannot narrow `T` to
`MyExclude<T, U>` on its own - lesson 10's type guards are the tool that
sometimes can.
