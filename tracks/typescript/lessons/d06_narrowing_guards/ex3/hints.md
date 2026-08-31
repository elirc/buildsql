## Hint 1

`value is Point` in the return type, and three questions before you may read a
property: is it an object, is it not `null`, and is it not an array.

## Hint 2

Even after those three, TypeScript will not let you write `value.x` - `object`
has no members. One narrow cast inside the guard is the accepted answer:

```ts
const candidate = value as { x?: unknown; y?: unknown };
```

Then `typeof candidate.x === "number"` twice finishes it. The cast is safe
precisely because it claims nothing: both members are still `unknown`.

Left to you: that cast, or indexing through `Record<string, unknown>`. Both are
one cast; say which one you would defend in review.
