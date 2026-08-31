## Hint 1

Write a whole second declaration, not an `extends`:

```ts
export interface ClubConfig {
  maxPlayers: number;
  rated: boolean;
}
```

Both declarations describe the same name, so TypeScript merges them into one
type with all three members. This is how module augmentation and every
`declare global` patch in the ecosystem work.

## Hint 2

The function itself is one template literal. Pull the rated wording into a
`const` first so the interpolation stays readable.

Left to you: whether the merged declaration goes above or below the function.
Merging does not care about order - say what you would choose for a reader.
