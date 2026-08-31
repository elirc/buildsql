## Hint 1

This is a mapped type with one modifier added: walk every key of `T` with
`[K in keyof T]` and decorate each member. Lesson 08's Concept section shows
the exact shape.

## Hint 2

The modifier goes in front of the bracket: `{ readonly [K in keyof T]: T[K] }`.
The gate's assignment probe only errors when every member really carries it -
a plain clone of `T` compiles the assignment and fails the test.
