## Hint 1

Two aliases, two utility types, and they are opposites: one names the members to
*keep*, the other names the members to *remove*. Choose whichever makes the
intent clearer - and for a "public user", what matters is which single field
must never leave the server.

## Hint 2

```ts
type A = Pick<User, "id" | "email">;   // exactly those two members
type B = Omit<User, "passwordHash">;   // everything except that one
```

For `toPublicUser`, destructuring with a rest element removes a property
without any `delete`:

```ts
const { secret, ...rest } = source;
```

`rest` is a genuinely new object, and TypeScript types it as the original minus
the destructured member - which is `Omit` in another spelling.

## Hint 3

`PublicUser` is `Omit<User, "passwordHash">`; `UserSummary` is
`Pick<User, "id" | "email">`. Implement `toPublicUser` with rest
destructuring and `toSummary` by building the two-member object literal.

Left to you: whether `toSummary` should also be written with destructuring.
Both work. One of them stops compiling if a member is renamed, and the other
one silently keeps working - decide which failure you would rather have.
