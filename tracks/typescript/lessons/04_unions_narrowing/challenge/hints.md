## Hint 1

`Result` is the shape half the TypeScript world uses instead of throwing: a
success carrying a value, or a failure carrying an error, in one type. Finish
the union, finish `Partitioned`, then write the two functions.

The discriminant here is not a string. It is a boolean, and that works just as
well - as long as each variant pins it to a *literal* `true` or `false` rather
than to `boolean`.

## Hint 2

```ts
type Result = { ok: true; value: string } | { ok: false; error: string };
```

`if (result.ok)` narrows to the first member, and the `else` narrows to the
second. Note what would break if you wrote `ok: boolean` in both variants:
`result.value` would stop being reachable, because a `boolean` cannot tell the
two apart.

`partition` walks the list once and pushes into one of two arrays.

## Hint 3

Finish the union as above, give `Partitioned` an `errors: string[]` alongside
`values`, write `unwrapOr` as a one-line conditional on `result.ok`, and write
`partition` as a loop with an `if`/`else` that pushes into the right array.

Left to you: whether `partition` uses a loop, two `filter` passes, or a
`reduce`. Try the `filter` version and see whether the narrowing survives -
what `filter` gives you back is the subject of lesson 10.
