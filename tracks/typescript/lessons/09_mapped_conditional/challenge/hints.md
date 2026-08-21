## Hint 1

Both halves recurse. The type maps every member, and for members that are
themselves objects it applies itself again. The function walks every value, and
for values that are objects it calls itself again before freezing.

Write the type first and read its error messages; they are unusually clear
about depth.

## Hint 2

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends SomeCheck ? DeepReadonly<T[K]> : T[K];
};
```

The check is "is this member an object?", which at the type level is
`T[K] extends object`. A type alias may refer to itself inside a conditional or
mapped type - that is how recursive types are written.

At runtime, `Object.freeze` is shallow. Freeze the children before the parent,
and remember `typeof null === "object"`.

## Hint 3

The type is the mapped type above with `T[K] extends object ? DeepReadonly<T[K]>
: T[K]`. The function iterates `Object.values(value)`, recurses into anything
that is a non-null object, then returns `Object.freeze(value)` with one cast.

Left to you: arrays and functions are `object` too, so both branches of your
conditional will meet them. Decide what `DeepReadonly<string[]>` *should* be
before you decide whether this implementation gives it to you - the honest
version in a library is considerably longer, and that is the point.
