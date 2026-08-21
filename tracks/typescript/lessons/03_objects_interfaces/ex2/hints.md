## Hint 1

The gate asserts that the object you were handed is unchanged afterwards, and
the type gate asserts that assigning to a property of a `Draft` does not
compile. Those are the same idea enforced at two different times.

Start by marking the members, then write a function that cannot mutate even if
it wanted to.

## Hint 2

`readonly` goes in front of a member name; for the array member you need it in
two places, because a `readonly string[]` property and a `readonly` property
holding a `string[]` are different promises:

```ts
interface Example {
  readonly id: string;          // cannot reassign the property
  readonly tags: readonly string[];   // ...and cannot push into it either
}
```

For the body, object spread copies every own property into a fresh object, and
later properties win over earlier ones.

## Hint 3

Mark all three members `readonly`, make `tags` a `readonly string[]`, and
return `{ ...draft, title }` - spread first, override second. Reverse those two
and the new title is immediately overwritten by the old one, which is a fun
five minutes to lose.

The decision left to you: whether `renameDraft` should also copy the `tags`
array. Spread is shallow, so both objects share one array; think about whether
that matters given how `tags` is now typed.
