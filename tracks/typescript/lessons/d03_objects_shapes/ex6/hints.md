## Hint 1

Fix the return type first: what comes out is a bag of real strings, so
`Record<string, string>` is the promise you can keep.

Then build a *new* object rather than deleting from a copy - `delete` leaves the
type claiming members the value no longer has.

## Hint 2

`Object.entries(meta)` gives you `[key, value]` pairs whose value type is
`string | undefined`, so you have to narrow before you can trim. One condition
covers both rules:

```ts
if (typeof value === "string" && value.trim() !== "")
```

Left to you: trim once into a local and reuse it, or trim twice. The first is
cheaper and reads better; the second is one line shorter.
