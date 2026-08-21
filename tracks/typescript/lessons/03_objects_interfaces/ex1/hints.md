## Hint 1

Two jobs, and the first one is not code you run. Read the gate's object
literals and write down every property they contain, its type, and whether it
is always there. One of the four is not.

Then write the rendering function against that shape.

## Hint 2

Members go one per line inside the braces, with a type after each name:

```ts
export interface Track {
  name: string;
  lessons: number;
}
```

A member whose name ends in `?` is optional, and reading it gives you
`T | undefined`. The gate passes objects that omit `challenge` entirely and
objects that set it to `false`, and both must render the same way - which
means a truthiness check is enough, and you do not need to compare to
`undefined`.

## Hint 3

The interface needs `slug`, `title` and `exercises` as required members plus an
optional `challenge`. The string is
`` `${slug}: ${title} - ${exercises} exercises` ``, with `" + challenge"`
appended when the flag is on.

Left to you: whether the suffix is a conditional expression, an `if`, or a
`+=`. Also worth trying once: delete the `?` from `challenge` and read the
error the gate's third object produces. That error is the interface doing its
job.
