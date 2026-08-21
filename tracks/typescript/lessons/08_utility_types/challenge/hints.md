## Hint 1

`Omit` is `Pick` over the keys you did *not* name. So the question becomes: how
do you subtract one union from another at the type level?

The standard library has a utility for exactly that, and you are allowed to use
it here - implementing it yourself is lesson 09's job.

## Hint 2

`Exclude<A, B>` removes from union `A` every member assignable to `B`:

```ts
type Rest = Exclude<"id" | "email" | "secret", "secret">;  // "id" | "email"
```

So the mapped type loops over `Exclude<keyof T, K>`.

The runtime half has a wrinkle: `delete obj.prop` is only allowed on optional
properties, so deleting from a `T` will not compile. Copy into something looser
first.

## Hint 3

`MyOmit<T, K>` is `{ [P in Exclude<keyof T, K>]: T[P] }`. For the body: spread
`source` into a `Record<string, unknown>`, `delete` each key, and cast the
result back on the way out.

Left to you: whether to build the result by *adding* the surviving keys instead
of deleting the named ones. The two versions behave differently for
inherited and non-enumerable properties - and one of them never needs `delete`,
which some codebases ban outright for performance reasons.
