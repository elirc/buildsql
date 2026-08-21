## Hint 1

Two of the three expected outputs are the same shape and one is not. Write
the three of them out and circle the single character that differs:

```
typescript: 15 lessons
react: 1 lesson
csharp: 0 lessons
```

That character is the whole exercise. Everything else is the same template
literal you wrote for ex1.

## Hint 2

You need a value that is `"lesson"` in exactly one case and `"lessons"` in
every other case — including zero. Compute it *before* you build the string,
then interpolate it like any other value.

The conditional operator (`condition ? a : b`) is the compact way; a plain
`if`/`else` that assigns to a `let` is equally correct and equally readable.

Be careful with the condition. "More than one" and "exactly one" agree on 15
and disagree on 0.

## Hint 3

The shape is:

```ts
const noun = /* the condition */ ? "lesson" : "lessons";
return `${name}: ${lessons} ${noun}`;
```

The condition compares `lessons` to `1` — and it is an equality test, not a
greater-than. Use `===`, not `==`; this course never uses `==`, and lesson 04
will explain why the distinction matters more in TypeScript than you would
expect.
