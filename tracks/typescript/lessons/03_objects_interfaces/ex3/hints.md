## Hint 1

The keys of this object are lesson slugs, and no one can list them in advance -
they come from the data. An interface that names its members cannot describe
that. TypeScript has a member form whose "name" is a type rather than an
identifier.

## Hint 2

An index signature declares the type of the key and the type of every value:

```ts
interface Scores {
  [name: string]: number;
}
```

`name` there is documentation - it could be `key` or `slug` and nothing
changes. What matters is that reading *any* string property now gives you
`number`, and that is a promise TypeScript takes at face value: `scores.nope`
typechecks and is `undefined` at runtime.

For the body, the first sighting of a slug has no entry yet, so treat a missing
count as zero. `??` is the operator that does that without also swallowing a
real `0`.

## Hint 3

Give `Tally` the member `[slug: string]: number`, start with an empty object
annotated as `Tally`, and for each slug write
`tally[slug] = (tally[slug] ?? 0) + 1`.

Left to you: whether to use `??` or `||` there. For counting they behave
identically - work out why, and then work out the case where they would not.
