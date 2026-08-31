## Hint 1

`extends` is already there; what is missing is a real type for `rating`.
`unknown` accepts every value, which means it rejects nothing and documents
nothing.

Then note the third assertion: an empty federation renders like a missing one.

## Hint 2

Build the bracketed fragment first:

```ts
const badge = player.federation ? ` (${player.federation})` : "";
```

A truthiness check covers both `undefined` and `""` in one question, and the
return becomes a single template literal with `badge` in the middle.

Left to you: truthiness, or an explicit `federation !== undefined && federation
!== ""`. The second is longer and says out loud what the first assumes.
