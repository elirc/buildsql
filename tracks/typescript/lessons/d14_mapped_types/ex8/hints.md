## Hint 1

Two steps: build a mapped type where each key becomes either itself or `never`,
then collapse the whole object into a union by indexing it with `[keyof T]` -
`never` disappears from unions, taking the required keys with it.

## Hint 2

The per-key question is "may a value omit this member?", and the honest probe
is `{} extends Pick<T, K>`: pick the single member out, and ask whether the
empty object satisfies the result. Do not test `undefined extends T[K]` - a
required member typed `string | undefined` would lie to you.

## Hint 3

The shape is `{ [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof
T]`. Left to you: why the `-?` is there. Remove it and inspect what
`OptionalKeys<Prefs>` becomes - the answer teaches you what optional members do
to the values you collect.
