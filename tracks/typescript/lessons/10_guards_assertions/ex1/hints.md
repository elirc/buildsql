## Hint 1

The body you are about to write is ordinary JavaScript: is this an object, is it
not null, does it have a string here and a number there. The interesting part is
the *return type*, which has to tell the compiler what a `true` answer means.

Run the type gate first and read what it says about `value` inside the `if`.

## Hint 2

A type predicate replaces `boolean` in the return position:

```ts
function isLesson(value: unknown): value is Lesson { ... }
```

Callers who write `if (isLesson(x))` now get `x` narrowed to `Lesson` inside the
block - which is narrowing that survives a function boundary, something
`typeof` alone cannot do.

Inside the body you still have an `unknown`, so check `typeof value === "object"`
and `value !== null` before you touch any property. Casting to
`Record<string, unknown>` after those two checks is the conventional way to
read properties without reaching for `any`.

## Hint 3

Signature: `isLesson(value: unknown): value is Lesson`. Body: reject non-objects
and `null`, then check `typeof candidate.slug === "string"` and
`typeof candidate.exercises === "number"`.

Left to you: whether extra properties should disqualify a value. This version
says no - it checks that the required members are present and well-typed and
ignores the rest, which is exactly what structural typing means.
