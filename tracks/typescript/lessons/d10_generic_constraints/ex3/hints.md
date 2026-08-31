## Hint 1

Return `Record<K, number>`, not `Record<string, number>`. `K extends string` is
what makes inference keep `"a" | "b"` instead of widening to `string`, and the
whole point of the exercise is that the result type names its own buckets.

## Hint 2

`const counts: Record<K, number> = {}` will not compile - an empty object is not
a complete record. `{} as Record<K, number>` is the accepted cast, and it is
honest because the next loop fills every key.

Seed all the declared buckets at zero *before* counting; that is what makes
`b: 0` appear and an unlisted value get ignored.

Left to you: how to test membership - `value in counts`, or a `Set` built from
the keys. One of them needs a cast at the increment; the other does not.
