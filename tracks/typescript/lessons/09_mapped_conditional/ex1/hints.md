## Hint 1

Lesson 08's `Readonly<T>` added a modifier to every member. This one takes the
same modifier away, and the syntax is the same loop with one extra character in
front.

The function is a copy - a *new* object the caller may write to. Which copy
idiom you already know applies here.

## Hint 2

Inside a mapped type, `readonly` and `?` can be added with `+` (the default) or
removed with `-`:

```ts
type Required<T> = { [K in keyof T]-?: T[K] };
type Mutable<T>  = { -readonly [K in keyof T]: T[K] };
```

The minus goes immediately before the modifier, outside the brackets for
`readonly` and after them for `?`.

## Hint 3

`Mutable<T>` is `{ -readonly [K in keyof T]: T[K] }`, and `thaw` returns
`{ ...frozen }`.

Left to you: whether the copy should be deep. This one is shallow, so a nested
object inside a frozen parent is still typed `readonly` in the original and
shared by the copy - which the challenge in this lesson takes seriously.
