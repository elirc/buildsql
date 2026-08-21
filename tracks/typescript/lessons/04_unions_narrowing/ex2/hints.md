## Hint 1

Read the gate's three event objects. They share two things - a `kind` and an
`exercise` - and each carries one member the others do not. That is the exact
shape a discriminated union describes: several object types unioned together,
all with a common literal-typed property.

Write the type first. The function is easy once the type is right.

## Hint 2

Each variant is its own object type, joined with `|`. Putting the leading `|`
on its own line keeps it readable:

```ts
type Answer =
  | { kind: "yes"; because: string }
  | { kind: "no" };
```

Then `switch (event.kind)` and TypeScript narrows `event` inside each `case` to
the one variant with that `kind` - which is how `event.attempts` becomes legal
in one branch and stays illegal in the others.

## Hint 3

Three variants: `pass` with `attempts: number`, `fail` with `message: string`,
`hint` with `tier: number`, all three carrying `kind` and `exercise: string`.
Then a `switch` over `event.kind` returning the three strings from the README.

The decision left to you: `switch` or a chain of `if`s. Both narrow. Only one
of them can be made to fail at compile time when a fourth variant appears -
which is ex4's subject, and a reason to build the habit now.
